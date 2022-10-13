import { HttpService, Injectable } from '@nestjs/common';
import { URLSearchParams } from 'url';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  Film,
  FilmsItem,
  GenreOld,
  GenresResult,
  LibraryItemType,
  MediaItem,
  SearchRequestResult,
  SearchRequestResultV2,
  TvItem,
} from '../models';
import { catchError, forkJoin, from, Observable } from 'rxjs';
import { EFilmsSortBy, EOrderType, FilmsChips } from './interface';
import { GenreService } from '../genres/genres.service';
import { GenreKind } from '../genres/const';
import { GenreBase } from '../genres/interface';
import { Genre } from '../models/genre';
import { LibraryService } from '../library/library.service';
import { LibraryItemEntity } from '../library/entites/library-item.entity';

const fs = require('fs');

@Injectable()
export class FilmsService {

  private readonly endpoint = '';
  private readonly key = '';

  private readonly imageHost = 'https://image.tmdb.org/t/p/w500';
  private readonly baseFilterFilms = {
    include_adult: false,
    page: 1,
  };

  constructor(
    private httpService: HttpService,
    private genreService: GenreService,
    private libraryService: LibraryService,
  ) {
  }

  foundItem(item: LibraryItemEntity): Observable<MediaItem | null> {
    return this.byId(item.imdbId, item.type).pipe(
      catchError(() => {
        return (item.type === LibraryItemType.movie
          ? this.searchMovieV2(item.title)
          : this.searchTvV2(item.title)).pipe(
          map(result => result.results.length ? result.results[0] : null),
        );
      }),
    );
  }

  byId(id: number, type: LibraryItemType): Observable<MediaItem> {
    let url = type === LibraryItemType.movie ? 'movie/' : 'tv/';
    url += id;

    return this.requestToApi<FilmsItem | TvItem>(url).pipe(
      withLatestFrom(this.genreService.list$),
      map(([item, genres]) => {
        const filmsGenres = this.mapFilmGenres(genres);
        item.genre_ids = item['genres'].map(it => it.id);
        return this.convertMediaItem(item, filmsGenres);
      }),
    );
  }

  searchMovie(
    query: string, chips?: FilmsChips, orderField?: EFilmsSortBy, orderType: EOrderType = EOrderType.desc,
  ): Observable<SearchRequestResult<Film>> {
    const params = {
      ...this.baseFilterFilms,
      query,
      ...chips,
    };
    if (orderField) {
      params['sort_by'] = orderField + '.' + orderType;
    }
    const url = query ? 'search/movie' : 'discover/movie';
    return this.requestToApi<SearchRequestResult<FilmsItem>>(url, params)
      .pipe(
        map(result => {
          return {
            ...result,
            results: result.results.map(item => this.convertFilm(item)),
          };
        }),
        map(result => {
          if (result.total_results > 1) {
            result.results.sort(this.sortFilmByRelation(query));
          }
          return result;
        }),
      );
  }

  private mapFilmGenres(genres: Genre[]): Record<number, number> {
    return genres.reduce((ob, item) => {
      if (item.imdbId) {
        ob[item.imdbId] = item.id;
      }

      return ob;
    }, {});
  }

  searchMovieV2(
    query: string, chips?: FilmsChips, orderField?: EFilmsSortBy, orderType: EOrderType = EOrderType.desc,
  ): Observable<SearchRequestResultV2<MediaItem>> {
    const params = {
      ...this.baseFilterFilms,
      query,
      ...chips,
    };
    if (orderField) {
      params['sort_by'] = orderField + '.' + orderType;
    }
    const url = query ? 'search/movie' : 'discover/movie';
    return this.requestToApi<SearchRequestResult<FilmsItem>>(url, params)
      .pipe(
        withLatestFrom(this.genreService.list$),
        map(([result, genres]) => {
          const filmsGenres = this.mapFilmGenres(genres);

          return {
            page: result.page,
            hasMore: result.total_pages > result.page,
            total: result.total_results,
            results: result.results.map(item => this.convertMediaItem(item, filmsGenres)),
          };
        }),
        switchMap(searchResult => {
          return from(this.libraryService.saveToRepository(searchResult.results, 'imdbId')).pipe(
            map(results => ({ ...searchResult, results })),
          );
        }),
        map(result => {
          if (result.results.length > 1) {
            result.results.sort(this.sortFilmByRelation(query));
          }
          return result;
        }),
      );
  }

  searchTv(
    query: string, chips?: FilmsChips, orderField?: EFilmsSortBy, orderType: EOrderType = EOrderType.desc,
  ): Observable<SearchRequestResult<Film>> {
    const params = {
      ...this.baseFilterFilms,
      query,
      ...chips,
    };
    if (orderField) {
      params['sort_by'] = orderField + '.' + orderType;
    }
    const url = query ? 'search/tv' : 'discover/tv';
    return this.requestToApi<SearchRequestResult<TvItem>>(url, params)
      .pipe(
        map(result => {
          return {
            ...result,
            results: result.results.map(item => this.convertTv(item)),
          };
        }),
        map(result => {
          if (result.total_results > 1) {
            result.results.sort(this.sortFilmByRelation(query));
          }
          return result;
        }),
      );
  }

  searchTvV2(
    query: string, chips?: FilmsChips, orderField?: EFilmsSortBy, orderType: EOrderType = EOrderType.desc,
  ): Observable<SearchRequestResultV2<MediaItem>> {
    const params = {
      ...this.baseFilterFilms,
      query,
      ...chips,
    };
    if (orderField) {
      params['sort_by'] = orderField + '.' + orderType;
    }
    const url = query ? 'search/tv' : 'discover/tv';
    return this.requestToApi<SearchRequestResult<TvItem>>(url, params)
      .pipe(
        withLatestFrom(this.genreService.list$),
        map(([result, genres]) => {
          const filmsGenres = this.mapFilmGenres(genres);

          return {
            page: result.page,
            hasMore: result.total_pages > result.page,
            total: result.total_results,
            results: result.results.map(item => this.convertMediaItem(item, filmsGenres, LibraryItemType.tv)),
          };
        }),
        switchMap(searchResult => {
          return from(this.libraryService.saveToRepository(searchResult.results, 'imdbId')).pipe(
            map(results => ({ ...searchResult, results })),
          );
        }),
        map(result => {
          if (result.results.length > 1) {
            result.results.sort(this.sortFilmByRelation(query));
          }
          return result;
        }),
      );
  }

  loadGenres(): Observable<GenreOld[]> {
    return forkJoin(
      this.requestToApi<GenresResult>('genre/movie/list'),
      this.requestToApi<GenresResult>('genre/tv/list'),
    ).pipe(
      map(([movie, tv]) => {
        return [
          ...movie.genres,
          ...tv.genres,
        ]
          .map(item => ({
            id: item.id,
            name: this.upperName(item.name),
          }))
          .filter((value, index, list) => list.findIndex(it => it.id === value.id) === index)
          .sort((a, b) => a.name.localeCompare(b.name));
      }),
    );
  }

  loadBaseGenres(): Observable<GenreBase[]> {
    return forkJoin(
      this.requestToApi<GenresResult>('genre/movie/list'),
      this.requestToApi<GenresResult>('genre/tv/list'),
    ).pipe(
      map(([movie, tv]) => {
        return [
          ...tv.genres.map(item => ({ ...item, kind: GenreKind.tv, imdbId: item.id })),
          ...movie.genres.map(item => ({ ...item, kind: GenreKind.films, imdbId: item.id })),
        ];
      }),
    );
  }

  saveGenres(list: GenreOld[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.writeFile('cache/genres-films.json', JSON.stringify(list), err => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  getGenres(): Observable<GenreOld[]> {
    /*const list$ = new Subject<Genre[]>();
    this.getGenresFromCache()
      .then(list => list$.next(list))
      .catch(() => this.loadGenres().subscribe(list => {
        list$.next(list);
        this.saveGenres(list);
      }));
    return list$.asObservable().pipe(take(1));*/
    return this.loadGenres();
  }

  requestToApi<T>(path: string, args = {}): Observable<T> {
    const params = new URLSearchParams();
    params.append('api_key', this.key);
    params.append('language', 'ru-Ru');

    for (const key in args) {
      params.append(key, args[key]);
    }
    const url = this.endpoint + path + '?' + params.toString();

    console.log('xxx url', url);

    return this.httpService.get<T>(url)
      .pipe(
        map(response => response.data),
      );
  }

  /**
   * @deprecated
   */
  private getGenresFromCache(): Promise<GenreOld[]> {
    return new Promise((resolve, reject) => {
      fs.readFile('cache/genres-films.json', null, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  private upperName(name: string): string {
    return name.substr(0, 1).toUpperCase() + name.substr(1);
  }

  private sortFilmByRelation(query: string) {
    return (a: { title: string }, b: { title: string }): number => {
      if (a.title === query) {
        return 1;
      }
      if (b.title === query) {
        return 1;
      }
      return 0;
    };
  }

  private convertFilm(item: FilmsItem): Film {
    return {
      title: item.title,
      genre_ids: item.genre_ids,
      original_title: item.original_title,
      date: item.release_date,
      year: this.getYear(item.release_date),
      popularity: item.popularity,
      description: item.overview,
      image: item.poster_path ? this.imageHost + item.poster_path : null,
      id: item.id,
      type: LibraryItemType.movie,
    };
  }

  private convertMediaItem(
    item: FilmsItem | TvItem,
    genres: Record<number, number>,
    type: LibraryItemType = LibraryItemType.movie,
  ): MediaItem {
    return {
      imdbId: item.id,
      title: (item as FilmsItem).title || (item as TvItem).name,
      genreIds: item.genre_ids.map(id => genres[id]),
      originalTitle: (item as FilmsItem).original_title || (item as TvItem).original_name,
      year: this.getYear((item as FilmsItem).release_date || (item as TvItem).first_air_date),
      popularity: item.vote_average,
      description: item.overview,
      image: item.poster_path ? this.imageHost + item.poster_path : null,
      type,
      url: null,
    };
  }

  private convertTv(item: TvItem): Film {
    return {
      title: item.name,
      genre_ids: item.genre_ids,
      original_title: item.original_name,
      date: item.first_air_date,
      year: this.getYear(item.first_air_date),
      popularity: item.popularity,
      description: item.overview,
      image: item.poster_path ? this.imageHost + item.poster_path : null,
      id: item.id,
      type: LibraryItemType.tv,
    };
  }

  private getYear(date: string): number {
    if (!date) {
      return null;
    }
    return +date.split('-')[0];
  }
}
