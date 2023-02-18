import { Injectable } from '@nestjs/common';
import { LibraryItemV2, MediaItem, MediaItemV2, PreparedItem } from "@filecab/models/library";
import { from, Observable, of, switchMap } from "rxjs";
import { LibraryService } from "./library.service";
import { combineLatest } from "rxjs/operators";
import { FilmsKinopoiskService } from "../films/kinopoisk/films-kinopoisk.service";
import { AnimeService } from "../anime/anime.service";

const fieldsList = [
  'shikimoriId',
  'smotretId',
  'imdbId'
];

const typesMap = {
  shikimoriId: 'anime',
  smotretId: 'anime',
  imdbId: 'films',
}

@Injectable()
export class MigrationService {

  constructor(
    private libraryService: LibraryService,
    private filmsService: FilmsKinopoiskService,
    private animeService: AnimeService,
  ) {
  }

  migrateItems(items: PreparedItem[]): Observable<{ errors: PreparedItem[], migrated: LibraryItemV2[] }> {
    console.log('xxx items', items);

    const byTypes = {};
    const errors = [];

    items.forEach(item => {
      for (const key of fieldsList) {
        if (item.item[key]) {
          if (!byTypes[key]) {
            byTypes[key] = [];
          }

          byTypes[key].push({
            ...item,
            id: item.item[key],
          });
          break;
        } else if(key === 'imdbId') {
          errors.push(item);
        }
      }
    });

    /*return combineLatest(
      ...Object.entries(byTypes).map(([field, item]) => this.l)
    )*/

    console.log('xxx grouped', byTypes);
    console.log('xxx errors', errors);

    return of();
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
