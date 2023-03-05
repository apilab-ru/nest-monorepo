import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import {
  catchError,
  combineLatest,
  delay,
  map,
  Observable,
  of,
  retryWhen,
  shareReplay,
  switchMap,
  take, throwError,
  timer
} from "rxjs";
import { BeatSaverItem, MapVersion } from "../interfaces/beatsaver";
import * as fs from 'fs';
import { TagsService } from "../../maps/services/tags-service";
import { MapEntity } from "../../maps/entites/mapEntity";
import { AuthorsService } from "./authors-service";
import { MapsService } from "../../maps/services/maps-service";

const camelCase = require("lodash/camelCase");
const flatMap = require("lodash/flatMap");
const uniq = require("lodash/uniq");
import { ErrorsService } from "@utils/exceptions/errors-service";
import { DifficultyDetail } from "../../maps/interfaces/map";
import { Difficulty } from "@bsab/api/map/difficulty";
import { environment } from '../../../environments/environment';
import { Like } from "typeorm";
import { ErrorEntity } from "@utils/exceptions/entities/error.entity";
import { MonoTypeOperatorFunction } from 'rxjs';

const path = require('path');

@Injectable()
export class ParserBeatSaverService {
  private fileDir = environment.fileDir;
  private fileDirRes = path.resolve(this.fileDir);
  private api = 'https://beatsaver.com/api/';

  constructor(
    private httpService: HttpService,
    private tagsService: TagsService,
    private authorsService: AuthorsService,
    private mapsService: MapsService,
    private errorsService: ErrorsService,
  ) {
  }

  loadPage(page = 0): Observable<MapEntity[]> {
    const docs$ = this.httpService.get<{ docs: BeatSaverItem[] }>(this.api + `search/text/${page}?sortOrder=Relevance`).pipe(
      map(res => this.filterIncorrectSourceMaps(res.data.docs)),
      switchMap(list => {
        return this.mapsService.getByIds(list.map(it => it.id)).pipe(
          map(foundedList => {
            const newItems = list.filter(it => !foundedList.find(f => f.id === it.id));

            const updateItems = list.filter(it => foundedList.find(f => f.id === it.id));

            return { newItems, updateItems: { list: updateItems, founded: foundedList } }
          })
        )
      }),
    );

    return docs$.pipe(
      switchMap(({ newItems, updateItems }) => combineLatest([
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
    sourceList.forEach(source => {
      const version = source.versions[source.versions.length - 1]!;

      const entity = list.find(it => it.id === source.id);

      entity.originalCoverURL = version.coverURL;
      entity.originalDownloadURL = version.downloadURL;
      entity.originalSoundURL = version.previewURL;
      entity.updatedAt = new Date(source.updatedAt);
      entity.lastPublishedAt = new Date(source.lastPublishedAt);

      entity.stats = source.stats;

      entity.coverURL = this.clearDir(entity.coverURL);
      entity.downloadURL = this.clearDir(entity.downloadURL);
      entity.soundURL = this.clearDir(entity.soundURL);
    })

    return this.mapsService.saveList(list);
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

  async fixFormat(): Promise<number> {
    const list = await this.mapsService
      .loadList({ offset: 10, limit: 60000 }, 60000);

    list.map(item => {
      const { minNps, maxNps } = this.calcNps(item.difsDetails);
      item.minNps = minNps;
      item.maxNps = maxNps;
    });

    return this.mapsService.saveList(list).toPromise().then(res => res.length);
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

  async migrate() {
    const list = await this.mapsService.loadSource({
      where: {
        // showed: true
      }
    });

    return this.mapsService.markAsShowedList(1, list.map(item => item.id));
  }

  async fixErrors(): Promise<any> {
    // const code = `QueryFailedError: ER_TRUNCATED_WRONG_VALUE_FOR_FIELD`;
    // const code = `ER_WARN_DATA_OUT_OF_RANGE: Out of range value for column 'bpm' at row 1`;
    // const code = `ER_DUP_ENTRY: Duplicate entry`;
    // const code = `ER_BAD_FIELD_ERROR: Unknown column 'Infinity'`;
    // const code = `ER_TRUNCATED_WRONG_VALUE_FOR_FIELD`;
    // const code = `ER_DATA_TOO_LONG: Data too long for column 'name'`;
    // const code = `ER_DATA_TOO_LONG: Data too long for column 'songSubName'`;
    // const code = `Error: Parse Error: Invalid header value char`;
    // const code = `ER_TRUNCATED_WRONG_VALUE: Truncated incorrect DOUBLE`;
    // const code = `connect ETIMEDOUT`;
    // const code = `Duplicate entry `;
    // const code = `ER_TRUNCATED_WRONG_VALUE_FOR_FIELD`;

    // const result = await this.errorsService.loadErrors();

    return this.getErrorsByType();

    /*const result = await this.errorsService.loadErrors({
      where: {
        error: Like(`%${code}%`)
      },
    })*/

    /*return result.map(item => ({
      ...item,
      data: JSON.parse(item.data),
    }))*/

    //const item = result[66];


    /*const list = this.filterIncorrectMaps(this.parseErrorList(result));

    return this.mapsService.saveList(list);*/

    /*const list = this.parseErrorList(result);

    return this.mapsService.saveList(list);*/


    /*return this.errorsService.deleteErrors({
      error: Like(`%${code}%`)
    })*/

    /*return {
      error: item.error,
      data: JSON.parse(item.data)
    }*/
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

  private convertItem(item: BeatSaverItem, tagsMap: Record<string, number>): Observable<MapEntity> {
    const version = item.versions[item.versions.length - 1]!;
    this.authorsService.pushAuthor(item.uploader);

    return this.uploadFiles(item.id, version).pipe(
      map((urls) => {

        const difsDetails = version.diffs.map(it => ({
          ...it,
          difficulty: camelCase(it.difficulty) as Difficulty,
        }));

        const { minNps, maxNps } = this.calcNps(difsDetails);

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          author: item.uploader.id,
          bpm: item.metadata.bpm,
          duration: item.metadata.duration,
          songName: item.metadata.songName,
          songSubName: item.metadata.songSubName,
          songAuthorName: item.metadata.songAuthorName,
          difs: version.diffs.map(it => camelCase(it.difficulty) as Difficulty),
          difsDetails,
          tags: this.tagsService.idsByTags(item.tags, tagsMap),
          stats: item.stats,
          uploaded: new Date(item.uploaded),
          automapper: item.automapper,
          ranked: item.ranked,
          qualified: item.qualified,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          lastPublishedAt: new Date(item.lastPublishedAt),
          showed: false,
          ...urls,
          originalCoverURL: version.coverURL,
          originalDownloadURL: version.downloadURL,
          originalSoundURL: version.previewURL,
          minNps,
          maxNps,
        };
      }),
    );
  }

  private retryTimeoutWithDelay(): MonoTypeOperatorFunction<string> {
    return retryWhen(errors => {
      return errors.pipe(
        switchMap(error => !error.toString().includes('connect ETIMEDOUT')
          ? throwError(() => error)
          : timer(10_000)
        ),
        take(1),
      )
    });
  }

  private uploadFiles(id: string, item: MapVersion): Observable<{ downloadURL: string, coverURL: string, soundURL: string }> {
    const dir = this.fileDir + id;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return combineLatest([
      this.uploadFile(item.downloadURL, id + '/zip.zip').pipe(
        this.retryTimeoutWithDelay(),
        catchError(error => {
          this.errorsService.addError(error, {
            id,
            downloadURL: item.downloadURL,
          });

          return of('');
        }),
      ),
      this.uploadFile(item.coverURL, id + '/cover.jpg').pipe(
        this.retryTimeoutWithDelay(),
        catchError(error => {
          this.errorsService.addError(error, {
            id,
            coverURL: item.coverURL,
          });
          return of('');
        }),
      ),
      this.uploadFile(item.previewURL, id + '/sound.mp3').pipe(
        this.retryTimeoutWithDelay(),
        catchError(error => {
          this.errorsService.addError(error, {
            id,
            previewURL: item.previewURL,
          })
          return of('');
        }),
      ),
    ]).pipe(
      map(([downloadURL, coverURL, soundURL]) => ({
        downloadURL,
        coverURL,
        soundURL,
      })),
      take(1),
    );
  }

  private uploadFile(url: string, fileName: string): Observable<string> {
    const pathLink = path.resolve(this.fileDir, fileName);
    const writer = fs.createWriteStream(pathLink);

    return new Observable(subject => {
      this.httpService.axiosRef({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 30_000,
      }).then(response => response.data.pipe(writer))
        .catch(error => {
          subject.error(error);
        });

      writer.on('finish', () => subject.next(this.clearDir(pathLink)));
      writer.on('error', error => subject.error(error));
    });
  }

  private clearDir(dir: string): string {
    const cleared = dir.replace(this.fileDir, '').replace(this.fileDirRes, '');

    return cleared;
  }

}
