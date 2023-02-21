import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { catchError, combineLatest, map, Observable, of, switchMap, take } from "rxjs";
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

const path = require('path');

@Injectable()
export class ParserBeatSaverService {
  private fileDir = environment.fileDir;
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
    return this.httpService.get<{ docs: BeatSaverItem[] }>(this.api + `search/text/${ page }?sortOrder=Relevance`).pipe(
      map(res => res.data.docs),
      switchMap(list => {
        return this.mapsService.getByIds(list.map(it => it.id)).pipe(
          map(foundedList => list.filter(it => !foundedList.find(f => f.id === it.id))),
        );
      }),
      switchMap(list => {
        if (!list.length) {
          return of([]);
        }

        const tags = uniq(flatMap(list, (it) => it.tags)).filter(tag => !!tag);

        return this.tagsService.findTags(tags).pipe(
          switchMap(tagsMap => combineLatest(
            list.map(item => this.convertItem(item, tagsMap))
          )),
        );
      }),
      switchMap(list => {
        if (!list.length) {
          return of([]);
        }

        return this.mapsService.saveList(list);
      }),
    );
  }

  async fixFormat() {
    const list = await this.mapsService
      .loadList({ offset: 10, limit: 60000 }, 60000);
    list.map(item => {
      const { minNps, maxNps } = this.calcNps(item.difsDetails);
      item.minNps = minNps;
      item.maxNps = maxNps;
    });
    return this.mapsService.saveList(list).toPromise().then(res => res.length);
  }

  private calcNps(difs: DifficultyDetail[]): { minNps: number, maxNps: number } {
    const npsList = difs.map(it => it.nps).filter(nps => !!nps);
    const minNps = Math.min(...npsList);
    const maxNps = Math.max(...npsList);
    return {
      minNps, maxNps,
    };
  }

  private convertItem(item: BeatSaverItem, tagsMap: Record<string, number>): Observable<MapEntity> {
    const version = item.versions[item.versions.length - 1]!;
    this.authorsService.pushAuthor(item.uploader);
    return combineLatest([
      this.tagsService.findTags(item.tags),
      this.uploadFiles(item.id, version),
    ]).pipe(
      map(([tags, urls]) => {

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
          minNps,
          maxNps,
        };
      }),
    );
  }

  private uploadFiles(id: string, item: MapVersion): Observable<{ downloadURL: string, coverURL: string, soundURL: string }> {
    const dir = this.fileDir + id;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return combineLatest([
      this.uploadFile(item.downloadURL, id + '/zip.zip').pipe(
        catchError(error => {
          this.errorsService.addError(error, {
            id,
            downloadURL: item.downloadURL,
          });
          return of('');
        }),
      ),
      this.uploadFile(item.coverURL, id + '/cover.jpg').pipe(
        catchError(error => {
          this.errorsService.addError(error, {
            id,
            coverURL: item.coverURL,
          });
          return of('');
        }),
      ),
      this.uploadFile(item.previewURL, id + '/sound.mp3').pipe(
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
      }).then(response => response.data.pipe(writer)).catch(error => {
        subject.error(error);
      });

      writer.on('finish', () => subject.next(pathLink));
      writer.on('error', error => subject.error(error));
    });
  }

}
