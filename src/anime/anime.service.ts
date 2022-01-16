import { HttpService, Injectable } from '@nestjs/common';
import { URLSearchParams } from 'url';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { combineLatest, from, Observable, of, Subject } from 'rxjs';
import {
  Anime,
  AnimeDescriptionSource,
  AnimeGenre,
  AnimeRequestResponse, GenreOld, SearchRequest,
  SearchRequestResult,
  SearchRequestResultV2,
  SmotretAnimeResponseItem,
} from '../models';
import { AnimeSearchQuery } from './interface';
import { GenreBase } from '../genres/interface';
import { GenreKind } from '../genres/const';
import { GenreService } from '../genres/genres.service';
import { SentryService } from '../sentry/sentry.service';
import { GenreEntity } from '../genres/entites/genre.entity';
import { MediaItem } from '../library/interface';
import { LibraryService } from '../library/library.service';
import { LibraryItemEntity } from '../library/entites/library-item.entity';

const fs = require('fs');
const DEFAULT_LIMIT = 50;
const CHIPS = {
  year: 'yearseason',
};

@Injectable()
export class AnimeService {
  private endpoint = 'https://smotret-anime.online/api/series/';
  private fields = '&id,titles,posterUrl,url,descriptions,genres,year,type,myAnimeListScore,worldArtScore,episodes,myAnimeListId,aniDbId';

  constructor(
    private httpService: HttpService,
    private genreService: GenreService,
    private sentryService: SentryService,
    private libraryService: LibraryService,
  ) {
  }

  searchV2(query: SearchRequest): Observable<SearchRequestResultV2<MediaItem>> {
    return this.genreService.list$.pipe(
      take(1),
      switchMap(genres => this.requestSearch(query, genres)),
      switchMap((list) => {
        return !list.length ? of([]) : combineLatest(list.map(item => this.convertToLibraryItem(item)));
      }),
      switchMap(list => {
        return from(this.libraryService.saveToRepository(list, 'smotretId'));
      }),
      map(results => ({
        results,
        page: query.page,
        hasMore: query.limit === results.length,
      })),
    );
  }

  search(query: AnimeSearchQuery): Observable<SearchRequestResult<Anime>> {
    return this.requestSearch(query)
      .pipe(
        map(list => list ? list.map(this.convertFromAnimeItem.bind(this)) : []),
        map(list => ({
          results: list as Anime[],
          page: 1,
          total_results: list.length,
          total_pages: 1,
        })),
      );
  }

  byId(id: number): Observable<Anime> {
    const params = new URLSearchParams();
    params.append('id', `${id}`);
    const url = this.endpoint + '?' + params.toString();

    return this.httpService.get<{ data: SmotretAnimeResponseItem }>(url)
      .pipe(
        map(response => response.data.data),
        map(item => this.convertFromAnimeItem(item)),
      );
  }

  foundItem(entity: LibraryItemEntity): Observable<MediaItem | null> {
    return this.byIdV2(entity.smotretId).pipe(
      catchError(() => this.searchV2({ name: entity.title }).pipe(
        map(result => result.results.length ? result.results[0] : null),
      )),
    );
  }

  byIdV2(id: number): Observable<MediaItem> {
    const params = new URLSearchParams();
    params.append('id', `${id}`);
    const url = this.endpoint + '?' + params.toString();

    return this.httpService.get<{ data: SmotretAnimeResponseItem }>(url)
      .pipe(
        map(response => response.data.data),
        switchMap(item => this.convertToLibraryItem(item)),
        tap(item => {
          this.libraryService.saveToRepository([item], 'smotretId');
        }),
      );
  }

  getGenres(): Observable<GenreOld[]> {
    const list$ = new Subject<GenreOld[]>();
    this.getGenresFromCache()
      .then(list => list$.next(list))
      .catch(() => this.loadGenres().subscribe(list => {
        list$.next(list);
        this.saveGenres(list);
      }));
    return list$.asObservable().pipe(take(1));
  }

  loadBaseGenres(): Observable<GenreBase[]> {
    return this.loadGenres().pipe(
      map(list => list.map(it => ({
        name: it.name,
        kind: GenreKind.anime,
        smotretId: it.id,
      }))),
    );
  }

  private chunk(list: number[], length: number): Array<number[]> {
    if (!list) {
      return [];
    }
    return [list.slice(0, length)].concat(this.chunk(list.slice(length), length));
  }

  private requestSearch(query: SearchRequest, dbGenres?: GenreEntity[]): Observable<SmotretAnimeResponseItem[]> {
    query.limit = Math.min(query.limit || DEFAULT_LIMIT, DEFAULT_LIMIT);
    query.page = query.page || 1;
    const { name, limit, page, ...chips } = query;

    const params = new URLSearchParams({
      // fields: this.fields,
      limit: `${limit}`,
    });

    if (name) {
      params.append('query', name);
    }

    if (page > 1) {
      params.append('offset', `${(page - 1) * limit}`);
    }

    let stChips = '';
    if (chips && JSON.stringify(chips) !== '{}') {
      stChips = 'chips=';

      if (chips.genre && dbGenres) {
        const genres = chips.genre.split(',').map(it => +it);
        const apiGenres = genres.map(it => dbGenres
          .find(dbIt => dbIt.id === it)?.smotretId,
        ).filter(it => !!it);
        chips.genre = apiGenres.join(',');
      }

      for (const key in chips) {
        stChips += (CHIPS[key] || key) + '=' + chips[key] + ';';
      }
    }
    const url = this.endpoint + '?' + params.toString() + '&' + stChips;

    return this.httpService.get<AnimeRequestResponse>(url).pipe(
      map(res => res.data.data),
    );
  }


  private loadGenres(): Observable<GenreOld[]> {
    const params = new URLSearchParams();
    params.append('fields', 'genres,titles,id');
    params.append('limit', '2000');
    const url = this.endpoint + '?' + params.toString();
    return this.httpService.get<AnimeRequestResponse>(url)
      .pipe(
        map(response => response.data),
        map(data => {
          const genres = {};
          data.data.forEach(item => {
            if (item.genres) {
              item.genres.forEach(it => {
                genres[it.id] = {
                  id: it.id,
                  name: it.title,
                };
              });
            }
          });
          const list = [];
          for (const i in genres) {
            list.push(genres[i]);
          }
          return list;
        }),
      );
  }

  private saveGenres(list: GenreOld[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.writeFile('cache/genres-anime.json', JSON.stringify(list), err => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  private getGenresFromCache(): Promise<GenreOld[]> {
    return new Promise((resolve, reject) => {
      fs.readFile('cache/genres-anime.json', null, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  private convertToLibraryItem(item: SmotretAnimeResponseItem): Observable<MediaItem> {
    return this.findGenres(item.genres).pipe(
      map(genreIds => ({
          title: item.titles.ru,
          image: item.posterUrl,
          url: item.url,
          description: this.getDescription(item),
          genreIds,
          originalTitle: item.titles.en,
          year: item.year,
          type: item.type,
          popularity: item.myAnimeListScore || item.worldArtScore,
          episodes: item.episodes && item.episodes.length,
          shikimoriId: item.myAnimeListId,
          aniDbId: item.aniDbId,
          smotretId: item.id,
        }),
      ));
  }

  private findGenres(list: AnimeGenre[]): Observable<number[]> {
    if (!list) {
      return of([]);
    }

    return this.genreService.findGenresAsync(
      list.map(it => this.genreService.prepareName(it.title)),
    );
  }

  private convertFromAnimeItem(item: SmotretAnimeResponseItem): Anime {
    if (!item) {
      this.sentryService.captureException({
        message: 'Null item',
        item,
      });
      throw Error('null item');
    }
    return {
      title: item.titles.ru,
      image: item.posterUrl,
      description: this.getDescription(item),
      genre_ids: item.genres ? item.genres.map(genre => genre.id) : [],
      original_title: item.titles.en,
      year: item.year,
      type: item.type,
      popularity: item.worldArtScore,
      id: item.id,
      episodes: item.episodes && item.episodes.length,
    };
  }

  private getDescription(item: SmotretAnimeResponseItem): string {
    if (!item.descriptions) {
      return null;
    }
    const base = item.descriptions.find(it => it.source === AnimeDescriptionSource.word_art);
    if (base) {
      return base.value;
    }
    return item.descriptions[0].value;
  }

}
