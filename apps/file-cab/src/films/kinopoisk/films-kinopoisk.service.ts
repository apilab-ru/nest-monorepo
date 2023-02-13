import { Injectable } from '@nestjs/common';
import { from, map, Observable, switchMap, take } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { GenreService } from '../../genres/genres.service';
import { LibraryService } from '../../library/library.service';
import { config } from '../../config/config';
import { MediaItem } from '../../library/interface';
import {
  KinopoiskDetailItem,
  KinopoiskSearchItemResponse,
  KinopoiskSearchParams,
  KinopoiskSearchResponse, KinopoiskSearchShortItemResult, KinopoiskSearchShortResult,
} from './interface';
import { withLatestFrom } from 'rxjs/operators';
import { LibraryItemEntity } from '../../library/entites/library-item.entity';
import { KINOPOISK_FILM_TYPE_MAP, KINOPOISK_GENRES_MAP } from './const';
import { Genre } from '../../models/genre';
import { SearchRequestResultV2 } from '../../models';
import { FilmSearchParams } from '../interface';

@Injectable()
export class FilmsKinopoiskService {
  private endpoint = 'https://kinopoiskapiunofficial.tech/api/';

  constructor(
    private httpService: HttpService,
    private genreService: GenreService,
    private libraryService: LibraryService,
  ) {
  }

  getByKinopoiskId(id: number): Observable<MediaItem> {
    return this.get<KinopoiskDetailItem>('v2.2/films/' + id).pipe(
      withLatestFrom(this.genreService.list$),
      switchMap(([data, genres]) => {
        const item = this.mapDetails(data, genres);
        return this.libraryService.saveToRepository([item], 'kinopoiskId')
          .then(list => list[0]);
      }),
    );
  }

  search(params: FilmSearchParams): Observable<SearchRequestResultV2<MediaItem>> {
    if (params.kinopoiskId) {
      return this.getByKinopoiskId(params.kinopoiskId).pipe(
        map(item => ({
          page: 1,
          results: [item],
          hasMore: false,
        })),
      );
    }

    if (params.name) {
      return this.requestSearchKeyword(params.name, params.page);
    }

    return this.genreService.list$.pipe(
      take(1),
      switchMap(genres => {
        const genreIds = params.genre?.split(',');
        const genreId = genreIds?.length ? +genreIds[0] : null;
        const kinopoiskGenre = genreId ? genres.find(it => it.id === genreId)?.kinopoiskId : null;

        return this.requestSearch({
          page: params.page,
          keyword: params.name,
          ...(params.year ? {
            yearFrom: +params.year,
            yearTo: +params.year,
          } : {}),
          ...(kinopoiskGenre ? {
            genres: kinopoiskGenre,
          } : {}),
        });
      }),
    );
  }

  private requestSearchKeyword(keyword: string, page = 1): Observable<SearchRequestResultV2<MediaItem>> {
    const perPage = 20;
    return this.get<KinopoiskSearchResponse>('v2.1/films/search-by-keyword', {
      keyword,
      page,
    }).pipe(
      withLatestFrom(this.genreService.list$),
      switchMap(([data, genres]) => {
        const list = data.films.map(item => this.mapKeywordSearchResult(item, genres));

        return from(this.libraryService.saveToRepository(list, 'kinopoiskId')).pipe(
          map(results => ({
            page,
            hasMore: data.searchFilmsCountResult > page * perPage,
            total: data.searchFilmsCountResult,
            results,
          })),
        );
      }),
    );
  }

  private requestSearch(params: KinopoiskSearchParams): Observable<SearchRequestResultV2<MediaItem>> {
    const perPage = 20;
    return this.get<KinopoiskSearchShortResult>('v2.2/films', {
      order: 'YEAR',
      type: 'ALL',
      ...params,
    }).pipe(
      withLatestFrom(this.genreService.list$),
      switchMap(([data, genres]) => {
        const list = data.items.map(item => this.mapSearchResult(item, genres));

        return from(this.libraryService.saveToRepository(list, 'kinopoiskId')).pipe(
          map(results => ({
            page: params.page,
            results,
            hasMore: data.total > params.page * perPage,
          })),
        );
      }),
    );
  }

  private mapSearchResult(detail: KinopoiskSearchShortItemResult, genres: Genre[]): Omit<LibraryItemEntity, 'id'> {
    return {
      title: detail.nameRu || detail.nameOriginal,
      originalTitle: detail.nameEn || detail.nameOriginal,
      description: null,
      image: detail.posterUrlPreview,
      genreIds: this.genreService.prepareGenres(
        detail.genres.map(({ genre }) => KINOPOISK_GENRES_MAP[genre], genres),
        genres,
        'kinopoiskId',
      ),
      episodes: null,
      popularity: this.toNumber(detail.ratingKinopoisk),
      year: this.toNumber(detail.year),
      type: KINOPOISK_FILM_TYPE_MAP[detail.type],
      url: null,
      imdbId: detail.imdbId ? +detail.imdbId.replace('tt', '') : null,
      kinopoiskId: detail.kinopoiskId,
    };
  }

  private mapKeywordSearchResult(detail: KinopoiskSearchItemResponse, genres: Genre[]): Omit<LibraryItemEntity, 'id'> {
    return {
      title: detail.nameRu || detail.nameEn || '',
      originalTitle: detail.nameEn,
      description: detail.description,
      image: detail.posterUrlPreview,
      genreIds: this.genreService.prepareGenres(
        detail.genres.map(({ genre }) => KINOPOISK_GENRES_MAP[genre], genres),
        genres,
        'kinopoiskId',
      ),
      episodes: null,
      popularity: this.toNumber(detail.rating),
      year: this.toNumber(detail.year),
      type: KINOPOISK_FILM_TYPE_MAP[detail.type],
      url: null,
      imdbId: null,
      kinopoiskId: detail.filmId,
    };
  }

  private mapDetails(detail: KinopoiskDetailItem, genres: Genre[]): Omit<LibraryItemEntity, 'id'> {
    return {
      title: detail.nameRu || detail.nameOriginal || '',
      originalTitle: detail.nameOriginal,
      description: detail.description,
      image: detail.posterUrlPreview,
      genreIds: this.genreService.prepareGenres(
        detail.genres.map(({ genre }) => KINOPOISK_GENRES_MAP[genre], genres),
        genres,
        'kinopoiskId',
      ),
      episodes: null,
      popularity: this.toNumber(detail.ratingKinopoisk),
      year: this.toNumber(detail.year),
      type: KINOPOISK_FILM_TYPE_MAP[detail.type],
      url: detail.webUrl,
      imdbId: detail.imdbId ? +detail.imdbId.replace('tt', '') : null,
      kinopoiskId: detail.kinopoiskId,
    };
  }

  private toNumber(value: string | number): number | null {
    return (value && value !== 'null') ? +value : null;
  }

  private get<T>(api: string, params?: Record<string, string | number>): Observable<T> {
    return this.httpService.get<T>(this.endpoint + api, {
      headers: {
        'x-api-key': config.films.kinopoiskKey,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'accept': 'application/json',
      },
      params,
    }).pipe(
      map(res => res.data),
    );
  }
}
