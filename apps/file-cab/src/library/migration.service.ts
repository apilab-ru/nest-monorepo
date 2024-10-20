import { Injectable } from '@nestjs/common';
import {
  LibraryItemV2,
  MediaItemId,
  MediaItemV2,
  MigrationResult,
  PreparedItem,
} from '@filecab/models/library';
import {
  combineLatest,
  concat,
  from,
  merge,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { LibraryService } from './library.service';
import { AnimeService } from '../anime/anime.service';
import { KinopoiskDevService } from '../films/kinopoisk-dev/kinopoisk-dev.service';
import { Types } from '@filecab/models/types';
import { map, toArray } from 'rxjs/operators';
import { KinopoiskService } from '../films/kinopoisk/kinopoisk.service';

const saveFields: (keyof MediaItemId)[] = [
  'kinopoiskId',
  'shikimoriId',
  'smotretId',
];

@Injectable()
export class MigrationService {
  constructor(
    private libraryService: LibraryService,
    private filmsService: KinopoiskDevService,
    private filmsOldService: KinopoiskService,
    private animeService: AnimeService,
  ) {}

  migrateItems(items: PreparedItem[]): Observable<MigrationResult> {
    const byTypes: Partial<Record<Types, PreparedItem[]>> = {};

    items.forEach((item) => {
      if (!byTypes[item.type]) {
        byTypes[item.type] = [];
      }

      byTypes[item.type].push(item);
    });

    return combineLatest(
      ...Object.entries(byTypes).map(([type, items]) =>
        type === Types.anime
          ? this.migrateAnime(items)
          : this.migrateFilms(items),
      ),
    ).pipe(
      map((list) => {
        const result: MigrationResult = {
          manyResults: [],
          migrated: [],
        };

        list.forEach((item) => {
          result.manyResults.push(...item.manyResults);
          result.migrated.push(...item.migrated);
        });

        return result;
      }),
    );
  }

  checkItems(items: LibraryItemV2[]): Observable<MigrationResult> {
    const byTypes: Partial<Record<keyof MediaItemId, LibraryItemV2[]>> = {};

    items.forEach((item) => {
      for (const field of saveFields) {
        if (item.item[field]) {
          if (!byTypes[field]) {
            byTypes[field] = [];
          }

          byTypes[field].push(item);
          break;
        }
      }
    });

    return combineLatest(
      Object.entries(byTypes).map(([field, list]) =>
        this.checkExisted(list, field as keyof MediaItemId),
      ),
    ).pipe(
      map((results) => {
        const response = {
          migrated: [],
          manyResults: [],
        };

        results.forEach((item) => {
          response.migrated.push(...item.migrated);
          response.manyResults.push(...item.manyResults);
        });

        return response;
      }),
    );
  }

  private checkExisted(
    list: LibraryItemV2[],
    field: keyof MediaItemId,
  ): Observable<MigrationResult> {
    return from(
      this.libraryService.loadByIds(
        list.map((item) => item.item[field]),
        field,
      ),
    ).pipe(
      switchMap((mediaList) => {
        const mediaSet = {};
        mediaList.forEach((item) => {
          mediaSet[item[field]] = item;
        });

        const notFound = [];
        const migrated = [];

        list.forEach((item) => {
          const id = item.item[field];

          if (mediaSet[id]) {
            migrated.push({
              ...item,
              item: mediaSet[id],
            });
          } else {
            notFound.push(item);
          }
        });

        if (!notFound.length) {
          return of({
            migrated,
            manyResults: [],
          });
        }

        return this.migrateItems(notFound).pipe(
          map((res) => ({
            migrated: [...migrated, ...res.migrated],
            manyResults: res.manyResults,
          })),
        );
      }),
    );
  }

  private migrateFilms(items: PreparedItem[]): Observable<MigrationResult> {
    const result: MigrationResult = {
      manyResults: [],
      migrated: [],
    };

    const list$ = items.map((item) =>
      this.filmsService
        .search({
          name: item.item.title,
        })
        .pipe(
          map((list) => {
            const mediaItem =
              list.results.length === 1
                ? list.results[0]
                : list.results.find((it) => it.title === item.item.title);

            if (mediaItem) {
              result.migrated.push({
                ...item,
                item: mediaItem as MediaItemV2,
              });
            } else {
              result.manyResults.push({
                item,
                list: list.results as MediaItemV2[],
              });
            }
          }),
        ),
    );

    return concat(...list$).pipe(
      toArray(),
      map(() => result),
    );
  }

  private migrateAnime(items: PreparedItem[]): Observable<MigrationResult> {
    const result: MigrationResult = {
      manyResults: [],
      migrated: [],
    };

    const $list = items.map((item) =>
      this.animeService.getByFieldId(item.item.shikimoriId, 'shikimoriId').pipe(
        map((list) => {
          const mediaItem =
            list.length === 1
              ? list[0]
              : list.find((it) => it.title === item.item.title);

          if (mediaItem) {
            result.migrated.push({
              ...item,
              item: mediaItem as MediaItemV2,
            });
          } else {
            result.manyResults.push({
              item,
              list: list as MediaItemV2[],
            });
          }
        }),
      ),
    );

    return concat(...$list).pipe(
      toArray(),
      map(() => result),
    );
  }
}
