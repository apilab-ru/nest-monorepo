import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  retryWhen,
  switchMap,
  take,
  throwError,
  timer,
} from 'rxjs';
import { MapVersion } from '../interfaces/beatsaver';
import * as fs from 'fs';

import { MonoTypeOperatorFunction } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MapsApiService } from './maps-api.service';
import { OrderDirection, OrderField } from '@bsab/api/request/request';

const path = require('path');

@Injectable()
export class ParserLocalService {
  private fileDir = environment.fileDir;
  private fileDirRes = path.resolve(this.fileDir);

  constructor(
    private httpService: HttpService,
    private mapsApiService: MapsApiService,
  ) {}

  loadMaps() {
    return this.mapsApiService.loadMaps({
      orderField: OrderField.createdAt,
      orderDirection: OrderDirection.desc,
      limit: 20,
      offset: 0,
    });
  }

  private retryTimeoutWithDelay(): MonoTypeOperatorFunction<string> {
    return retryWhen((errors) => {
      return errors.pipe(
        switchMap((error) =>
          !error.toString().includes('connect ETIMEDOUT')
            ? throwError(() => error)
            : timer(10_000),
        ),
        take(1),
      );
    });
  }

  private uploadFiles(
    id: string,
    item: MapVersion,
  ): Observable<{ downloadURL: string; coverURL: string; soundURL: string }> {
    const dir = this.fileDir + id;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return combineLatest([
      this.uploadFile(item.downloadURL, id + '/zip.zip').pipe(
        this.retryTimeoutWithDelay(),
        catchError((error) => {
          /*this.errorsService.addError(error, {
                  id,
                  downloadURL: item.downloadURL,
               });*/

          return of('');
        }),
      ),
      this.uploadFile(item.coverURL, id + '/cover.jpg').pipe(
        this.retryTimeoutWithDelay(),
        catchError((error) => {
          /*this.errorsService.addError(error, {
                  id,
                  coverURL: item.coverURL,
               });*/
          return of('');
        }),
      ),
      this.uploadFile(item.previewURL, id + '/sound.mp3').pipe(
        this.retryTimeoutWithDelay(),
        catchError((error) => {
          /*this.errorsService.addError(error, {
                  id,
                  previewURL: item.previewURL,
               })*/
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

    return new Observable((subject) => {
      this.httpService
        .axiosRef({
          url,
          method: 'GET',
          responseType: 'stream',
          timeout: 30_000,
        })
        .then((response) => response.data.pipe(writer))
        .catch((error) => {
          subject.error(error);
        });

      writer.on('finish', () => subject.next(this.clearDir(pathLink)));
      writer.on('error', (error) => subject.error(error));
    });
  }

  private clearDir(dir: string): string {
    const cleared = dir.replace(this.fileDir, '').replace(this.fileDirRes, '');

    return cleared;
  }
}
