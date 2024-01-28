import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import {
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  take,
} from "rxjs";
import { BeatSaverItem } from "../interfaces/beatsaver";
import { TagsService } from "@bsab/shared/maps/services/tags-service";
import { MapEntity } from "@bsab/shared/maps/entites/mapEntity";
import { AuthorsService } from "./authors-service";
import { MapsService } from "@bsab/shared/maps/services/maps-service";

const camelCase = require("lodash/camelCase");
const flatMap = require("lodash/flatMap");
const uniq = require("lodash/uniq");

import { ErrorsService } from "@utils/exceptions/errors-service";
import { DifficultyDetail } from "@bsab/shared/maps/interfaces/map";
import { Difficulty } from "@bsab/api/map/difficulty";

import { ErrorEntity } from "@utils/exceptions/entities/error.entity";
import { MapUrls } from "@bsab/api/map/map-detail";

@Injectable()
export class ParserBeatSaverService {
  private api = 'https://beatsaver.com/api/';

  constructor(
    private httpService: HttpService,
    private tagsService: TagsService,
    private authorsService: AuthorsService,
    private mapsService: MapsService,
    private errorsService: ErrorsService,
  ) {
  }

  loadPage(page = 0, reload = false): Observable<MapEntity[]> {
    const docs$ = this.httpService.get<{
      docs: BeatSaverItem[]
    }>(this.api + `search/text/${ page }?sortOrder=Relevance`).pipe(
      map(res => this.filterIncorrectSourceMaps(res.data.docs)),
      switchMap(list => {
        return this.mapsService.getByIds(list.map(it => it.id)).pipe(
          map(foundedList => {
            const newItems = list.filter(it => !foundedList.find(f => f.id === it.id));

            const updateItems = !reload ? [] : list.filter(it => foundedList.find(f => f.id === it.id));

            return {newItems, updateItems: {list: updateItems, founded: foundedList}}
          })
        )
      }),
    );

    return docs$.pipe(
      switchMap(({newItems, updateItems}) => combineLatest([
        this.addMaps(newItems),
        this.updateMaps(updateItems.list, updateItems.founded)
      ])),
      take(1),
      map(list => list.flat()),
    )
  }

  private addMaps(list: BeatSaverItem[]): Observable<MapEntity[]> {
    if (!list.length) {
      return of([]);
    }

    const tags = uniq(flatMap(list, (it) => it.tags)).filter(tag => !!tag);

    return this.tagsService.findTags(tags).pipe(
      switchMap(tagsMap => combineLatest(
        list.map(item => this.convertItem(item, tagsMap))
      )),
      switchMap(list => this.mapsService.saveList(list))
    );
  }

  private updateMaps(sourceList: BeatSaverItem[], list: MapEntity[]): Observable<MapEntity[]> {
    if (!sourceList.length) {
      return of([])
    }

    const updateList = [];

    sourceList.forEach(source => {
      const version = source.versions[source.versions.length - 1]!;

      const entity = list.find(it => it.id === source.id);

      entity.originalCoverURL = version.coverURL;
      entity.originalDownloadURL = version.downloadURL;
      entity.originalSoundURL = version.previewURL;
      entity.updatedAt = new Date(source.updatedAt);
      entity.lastPublishedAt = new Date(source.lastPublishedAt);
      entity.ranked = source.ranked;

      entity.stats = source.stats;

      updateList.push(entity);

      /*entity.coverURL = this.clearDir(entity.coverURL);
      entity.downloadURL = this.clearDir(entity.downloadURL);
      entity.soundURL = this.clearDir(entity.soundURL);*/
    })

    return this.mapsService.saveList(updateList);
  }

  private filterIncorrectMaps(list: MapEntity[]): MapEntity[] {
    return list
      .filter(item => item.duration > 90)
      .filter(item => item.songName.length < 250)
      .filter(item => item.songSubName.length < 250)
      .filter(item => item.name.length < 250);
  }

  private filterIncorrectSourceMaps(list: BeatSaverItem[]): BeatSaverItem[] {
    return list
      .filter(item => item.metadata.duration > 90)
      .filter(item => item.name.length < 250);
  }

  private async getErrorsByType(): Promise<Record<string, number>> {
    const result = await this.errorsService.loadErrors();

    const byError = {};

    result.forEach(item => {
      if (!byError[item.error]) {
        byError[item.error] = 0;
      }

      byError[item.error] = byError[item.error] + 1;
    })

    return byError;
  }

  private parseErrorList(list: ErrorEntity[]): MapEntity[] {
    return list.map(item => {
      const data = JSON.parse(item.data) as MapEntity;

      const nps = this.calcNps(data.difsDetails);

      data.minNps = nps.maxNps;
      data.maxNps = nps.maxNps;

      return data;
    })
  }

  private calcNps(difs: DifficultyDetail[]): { minNps: number, maxNps: number } {
    const npsList = difs.map(it => it.nps).filter(nps => !!nps);

    if (!npsList.length) {
      return {
        minNps: 0,
        maxNps: 0,
      };
    }

    const minNps = Math.min(...npsList);
    const maxNps = Math.max(...npsList);

    return {
      minNps, maxNps,
    };
  }

  private prepareItemUrls(itemId: string): MapUrls {
    return {
      downloadURL: `/${ itemId }/zip.zip`,
      coverURL: `/${ itemId }/cover.jpg`,
      soundURL: `/${ itemId }/sound.mp3`
    }
  }

  private convertItem(item: BeatSaverItem, tagsMap: Record<string, number>): Observable<MapEntity> {
    const version = item.versions[item.versions.length - 1]!;
    this.authorsService.pushAuthor(item.uploader);

    const diffsDetails = version.diffs.map(it => ({
      ...it,
      difficulty: camelCase(it.difficulty) as Difficulty,
    }));

    const {minNps, maxNps} = this.calcNps(diffsDetails);

    const entity: MapEntity = {
      id: item.id,
      name: item.name,
      description: item.description,
      author: item.uploader.id,
      bpm: item.metadata.bpm,
      duration: item.metadata.duration,
      songId: null,
      songName: item.metadata.songName,
      songSubName: item.metadata.songSubName,
      songAuthorName: item.metadata.songAuthorName,
      difs: version.diffs.map(it => camelCase(it.difficulty) as Difficulty),
      difsDetails: diffsDetails,
      tags: this.tagsService.idsByTags(item.tags, tagsMap),
      stats: item.stats,
      uploaded: new Date(item.uploaded),
      automapper: item.automapper,
      ranked: item.ranked,
      blRankedDate: null,
      qualified: item.qualified,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      lastPublishedAt: new Date(item.lastPublishedAt),
      ...this.prepareItemUrls(item.id),
      originalCoverURL: version.coverURL,
      originalDownloadURL: version.downloadURL,
      originalSoundURL: version.previewURL,
      minNps,
      maxNps,
    }

    return of(entity);
  }
}
