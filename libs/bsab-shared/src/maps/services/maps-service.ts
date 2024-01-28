import { Injectable } from '@nestjs/common';
import { catchError, combineLatest, from, map, mapTo, Observable, of } from 'rxjs';
import { Connection, Repository } from 'typeorm';
import { MapEntity } from '../entites/mapEntity';
import { ErrorsService } from '@utils/exceptions/errors-service';
import { MapsSearch } from '../interfaces/maps-search';
import { OrderField } from '../interfaces/map';
import { MapDetail } from '@bsab/api/map/map-detail';
import { FindManyOptions } from "typeorm/find-options/FindManyOptions";
import { UserMapShowEntity } from "../entites/userMapShowEntity";
import { PageResponse } from "@bsab/api/map/page";
import { OrderDirectionDTO } from "@bsab/api/request/request";

@Injectable()
export class MapsService {
  private repository: Repository<MapEntity>;
  private shownRepo: Repository<UserMapShowEntity>;

  constructor(
    connection: Connection,
    private errorsService: ErrorsService
  ) {
    this.repository = connection.getRepository(MapEntity);
    this.shownRepo = connection.getRepository(UserMapShowEntity);
  }

  markAsShowedList(userId: number, ids: string[]): Promise<void> {
    const list = ids.map(mapId => ({ userId, mapId }));

    return this.shownRepo.upsert(list, ['mapId', 'userId']).then();
  }

  getByIds(ids: string[]): Observable<MapEntity[]> {
    return from(this.repository.findByIds(ids));
  }

  updateItem(item: MapEntity): Observable<MapEntity> {
     return from(this.repository.save(item)).pipe(
        map(result => item)
     );
  }

  upsertItem(item: MapEntity): Observable<MapEntity> {
    return from(this.repository.upsert(item, ['id'])).pipe(
      map(result => item)
    );
  }

  saveList(list: MapEntity[]): Observable<MapEntity[]> {
    if (!list.length) {
      return of([])
    }

    return combineLatest(
      list.map(item => this.upsertItem(item).pipe(
        catchError(error => {
          this.errorsService.addError(error, item);

          return of(null);
        })
      ))
    ).pipe(
      mapTo(list)
    );
  }

  loadListDetails(query: MapsSearch, userId?: number): Promise<PageResponse<MapDetail>> {
    const maxLimit = 100;

    return this.loadList(query, maxLimit, userId).then(res => ({
       ...res,
       list: res.list.map(item => this.mapConvert(item))
    }));
  }

  loadById(id: string): Promise<MapDetail> {
    return this.repository.findOneBy({
      id
    }).then(res => {
      if (!res) {
        throw new Error('notFound');
      }

      return this.mapConvert(res);
    })
  }

  loadSource(options?: FindManyOptions<MapEntity>): Promise<MapEntity[]> {
    return this.repository.find(options);
  }

  async loadList(query: MapsSearch, maxLimit = 100, userId?: number): Promise<PageResponse<MapEntity>> {
    const queryRunner = this.repository.createQueryBuilder('maps');
    const limit = Math.min(query.limit || 10, maxLimit);
    const offset = query.offset || 0;

    queryRunner.limit(limit);
    queryRunner.offset(offset);
    queryRunner.orderBy('id');

    if (!userId) {
       queryRunner.andWhere('maps.originalCoverURL IS NOT NULL')
    }

    if (query.search) {
      queryRunner.andWhere('(maps.name like :search ' +
        'or maps.description like :search ' +
        'or maps.songName like :search' +
        ')', {
        search: '%' + query.search + '%'
      });
    }

    if (query.tagsPositive) {
      const ids = JSON.parse(query.tagsPositive).map(it => +it);
      if (ids.length) {
        queryRunner.andWhere(
          '('
          + ids.map(tag => `JSON_CONTAINS(maps.tags, "${tag}")`).join(' AND ')
          + ')'
        );
      }
    }

    if (query.tagsNegative) {
      const ids = JSON.parse(query.tagsNegative).map(it => +it);
      if (ids.length) {
        queryRunner.andWhere(
          '('
          + ids.map(tag => `not JSON_CONTAINS(maps.tags, "${tag}")`).join(' AND ')
          + ')'
        );
      }
    }

    if (query.npsFrom) {
      queryRunner.andWhere('maps.maxNps >= :npsFrom', {
        npsFrom: query.npsFrom
      });
    }

    if (query.npsTo) {
      queryRunner.andWhere('maps.minNps <= :npsTo', {
        npsTo: query.npsTo
      });
    }

    if (query.dateFrom) {
      queryRunner.andWhere('DATE(maps.createdAt) >= :dateFrom', {
        dateFrom: query.dateFrom
      });
    }

    if (query.showed !== undefined && userId) {
      queryRunner.leftJoin(
        'user_map_show',
        'userShown',
        'userShown.mapId = maps.id and userShown.userId = :userId',
        { userId }
      )

      queryRunner.andWhere(`userShown.userId ${query.showed === 'true' ? ('= ' + userId) : 'IS NULL'}`, {
        showed: query.showed === 'true' ? userId : '',
      });
    }

    if (query.bpmFrom) {
      queryRunner.andWhere('bpm >= :bpmFrom', {
        bpmFrom: query.bpmFrom
      });
    }

    if (query.bpmTo) {
      queryRunner.andWhere('bpm <= :bpmTo', {
        bpmTo: query.bpmTo
      });
    }

    if (query.recommended && userId) {
      queryRunner.distinctOn(['maps.id'])

      queryRunner.leftJoin(
        'user_songs',
        'us',
        '(us.song = maps.songName or us.song = maps.songSubName) and us.user_id = :userId',
        { userId }
      );

      queryRunner.leftJoin(
        'user_artists',
        'ua',
        'ua.artist = maps.songAuthorName and ua.user_id = :userId',
        { userId }
      );

      queryRunner.andWhere('((us.id is not NULL) or (ua.id is not NULL))')
    }

    if (query.ranked) {
       queryRunner.andWhere('ranked = :ranked', {
          ranked: query.ranked === 'true' ? 1 : 0
       });
    }

    if (query.durationFrom) {
      queryRunner.andWhere('duration >= :durationFrom', {
        durationFrom: query.durationFrom
      });
    }

    if (query.durationTo) {
      queryRunner.andWhere('duration <= :durationTo', {
        durationTo: query.durationTo
      });
    }

    if (query.scoreFrom) {
      queryRunner.andWhere('JSON_EXTRACT(maps.stats, "$.score") >= :score', {
        score: +query.scoreFrom / 100
      })
    }

    if (query.blRanked) {
      queryRunner.andWhere('blRankedDate is not NULL')
    }

    const orderFiled = OrderField[query.orderField] || OrderField.createdAt;
    const orderDirection = OrderDirectionDTO[query.orderDirection] || OrderDirectionDTO.desc;

    queryRunner.orderBy(orderFiled, orderDirection);

    const list = await queryRunner.getMany();
    const total = await queryRunner.getCount();

    return {
       list,
       total,
       offset,
       limit
    }
  }

  private mapConvert(item: MapEntity): MapDetail {
    return {
      ...item,
      showed: false,
      sourceUrl: item.downloadURL,
      author: '',
      createdAt: item.createdAt as undefined as string,
      updatedAt: item.updatedAt as undefined as string
    };
  }

  markAsShowed(id: string, userId: number): Promise<void> {
    return this.markAsShowedList(userId, [id])
  }

   markAsNotWorking(id: string): Promise<void> {
     return this.repository.findOneBy({
        id
     }).then(entity => {
        if (!entity) {
           throw new Error('notFound');
        }

        entity.version = '3';

        return this.repository.save(entity).then(() => {})
     })
   }
}
