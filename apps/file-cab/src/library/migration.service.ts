import { Injectable } from '@nestjs/common';
import { LibraryItemV2, MediaItemV2, MigrationResult, PreparedItem } from "@filecab/models/library";
import { combineLatest, concat, Observable} from "rxjs";
import { LibraryService } from "./library.service";
import { AnimeService } from "../anime/anime.service";
import { KinopoiskDevService } from "../films/kinopoisk-dev/kinopoisk-dev.service";
import { Types } from "@filecab/models/types";
import { map, toArray } from "rxjs/operators";

@Injectable()
export class MigrationService {

  constructor(
    private libraryService: LibraryService,
    private filmsService: KinopoiskDevService,
    private animeService: AnimeService,
  ) {
  }

  migrateItems(items: PreparedItem[]): Observable<MigrationResult> {
    const byTypes: Partial<Record<Types, PreparedItem[]>> = {};

    items.forEach(item => {
      if (!byTypes[item.type]) {
        byTypes[item.type] = [];
      }

      byTypes[item.type].push(item);
    });

    return combineLatest(
      ...Object.entries(byTypes).map(([type, items]) => type === Types.films
        ? this.migrateFilms(items)
        : this.migrateAnime(items)
      )
    ).pipe(
      map(list => {
        const result: MigrationResult = {
          manyResults: [],
          migrated: [],
        };

        list.forEach(item => {
          result.manyResults.push(...item.manyResults);
          result.migrated.push(...item.migrated);
        })

        return result;
      })
    );
  }

  private migrateFilms(items: PreparedItem[]): Observable<MigrationResult> {
    const result: MigrationResult = {
      manyResults: [],
      migrated: [],
    };

    const list$ = items.map(item => this.filmsService.search({
        name: item.item.title,
      }).pipe(
        map(list => {
          const mediaItem = list.results.length === 1
            ? list.results[0]
            : list.results.find(it => it.title === item.item.title);

          if (mediaItem) {
            result.migrated.push({
              ...item,
              item: mediaItem as MediaItemV2,
            });
          } else {
            result.manyResults.push({
              item,
              list: list.results as MediaItemV2[],
            })
          }
        })
      )
    )

    return concat(
      ...list$
    ).pipe(
      toArray(),
      map(() => result),
    );
  }

  private migrateAnime(items: PreparedItem[]): Observable<MigrationResult> {
    return concat(
      ...items.map(item => this.animeService.getByFieldId(item.item.shikimoriId, 'shikimoriId'))
    ).pipe(
      toArray(),
      map(results => {
        return {
          manyResults: [],
          migrated: results.map((item, index) => ({
            ...items[index],
            item
          } as LibraryItemV2))
        }
      }),
    )
  }


  /*private loadItems(ids: number[], field: keyof MediaItem): Observable<MediaItemV2[]> {
    const provider = typesMap[field] === 'films' ? this.filmsService : this.animeService;

    return from(this.libraryService.loadByIds(ids, field)).pipe(
      switchMap(list => {
        if (list.length === ids.length) {
          return of(list)
        }

        const newItems = ids.filter(id => !list.find(item => item[field] === id));
      })
    )
  }*/
}
