import { Injectable } from '@nestjs/common';
import {
  BeatLeaderItem,
  BeatLeaderResponse,
  BeatLeaderResponseItem,
} from '../interfaces/beat-leader';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, from, map, Observable, of, switchMap } from 'rxjs';
import { format } from 'date-fns';
import { OrderDirection } from '@bsab/api/request/request';
import { MapsService } from '@bsab/shared/maps';
import { In } from 'typeorm/find-options/operator/In';
import { MapEntity } from '@bsab/shared/maps/entites/mapEntity';

// Documentation https://api.beatleader.xyz/swagger/index.html

@Injectable()
export class BeatLeaderService {
  private readonly api = 'https://api.beatleader.xyz/';
  private readonly limit = 1000;
  private readonly loadMore = true;
  private readonly uncertainDate = '0000-00-00 00:00:00';

  constructor(
    private httpService: HttpService,
    private mapsService: MapsService,
  ) {}

  private getTime(item?: MapEntity): number {
    if (!item) {
      return 0;
    }

    if (item.blRankedDate === this.uncertainDate) {
      return 0;
    }

    return new Date(item.blRankedDate).getTime() / 1000;
  }

  updateBeatLeaders(): Observable<any[]> {
    const lastDate$ = from(
      this.mapsService
        .loadList({
          blRanked: 'true',
          orderField: 'blRankedDate',
          orderDirection: OrderDirection.desc,
          limit: 1,
          offset: 0,
        })
        .then(({ list }) => this.getTime(list?.[0])),
    );

    return lastDate$.pipe(
      switchMap((lastDate) => this.loadRankedSongs(lastDate)),
      switchMap(async (list) => {
        const source = await this.mapsService.loadSource({
          where: {
            id: In(list.map((item) => item.id)),
          },
        });

        const rankedMap = {};
        list.forEach((item) => {
          rankedMap[item.id] = item;
        });

        source.forEach((item) => {
          item.blRankedDate = rankedMap[item.id].rankedDate;
        });

        const result = await firstValueFrom(this.mapsService.saveList(source));

        return result.map((item) => ({
          id: item.id,
          blRankedDate: item.blRankedDate,
        }));
      }),
    );
  }

  private loadRankedSongs(
    dateFrom?: number,
    page = 1,
  ): Observable<BeatLeaderItem[]> {
    if (isNaN(dateFrom)) {
      dateFrom = 0;
    }

    return this.loadPage(page, dateFrom);
  }

  private loadPage(
    page: number,
    dateFrom?: number,
  ): Observable<BeatLeaderItem[]> {
    return this.httpService
      .get<BeatLeaderResponse>(this.api + 'leaderboards', {
        params: {
          page,
          count: this.limit,
          type: 'ranked',
          order: 'asc',
          sortBy: 'timestamp',
          ...(dateFrom ? { date_from: dateFrom } : {}),
        },
        headers: {
          'Accept-Encoding': 'gzip,deflate,compress',
        },
      })
      .pipe(
        switchMap(({ data }) => {
          const list = data.data.map((item) => this.mapResponseItem(item));
          const { metadata } = data;

          if (metadata.total > page * metadata.itemsPerPage && this.loadMore) {
            return this.loadPage(page + 1, dateFrom).pipe(
              map((response) => [...response, ...list]),
            );
          }

          return of(list);
        }),
      );
  }

  private convertDateStringToTimestamp(dateISO: string): number {
    return Math.ceil(new Date(dateISO).getTime() / 1000);
  }

  private mapResponseItem(item: BeatLeaderResponseItem): BeatLeaderItem {
    const [bsabId] = item.song.id.split('xxx');

    return {
      id: bsabId,
      rankedDate: !item.difficulty.rankedTime
        ? this.uncertainDate
        : format(
            new Date(item.difficulty.rankedTime * 1000),
            'yyyy-MM-dd hh:mm:ss',
          ),
      stars: item.difficulty.stars,
    };
  }
}
