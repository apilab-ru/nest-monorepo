import { Injectable } from "@nestjs/common";
import { config } from '../../config/config';
import { map, Observable, switchMap, take } from "rxjs";
import { FilmSearchParams, MediaItem, SearchRequestResultV2 } from "@filecab/models";
import { HttpService } from "@nestjs/axios";
import { GenreService } from "../../genres/genres.service";
import { LibraryService } from "../../library/library.service";
import { KINOPOISK_DEV_FILM_TYPE_MAP, KinopoiskDevFileds, KinopoiskDevTypes } from "./const";
import {
  KinopoiskDevDetails,
  KinopoiskDevPagination,
  KinopoiskDevRequestSearch,
  KinopoiskDevResponse, KinopoiskDevShortItem
} from "./interface";
import { withLatestFrom } from "rxjs/operators";
import { Genre } from "@filecab/models/genre";
import { KINOPOISK_GENRES_MAP } from "../kinopoisk/const";
import { Types } from "@filecab/models/types";
import { EMPTY_POSTER } from "../../base/const";
import { ErrorsService } from "@utils/exceptions/errors-service";

@Injectable()
export class KinopoiskDevService {
  private endpoint = 'https://api.kinopoisk.dev/v1/';
  private tokens = config.films.kinopoiskDev;

  constructor(
    private httpService: HttpService,
    private genreService: GenreService,
    private libraryService: LibraryService,
    private errorsService: ErrorsService,
  ) {
  }

  getByFieldId(id: number, field: keyof typeof KinopoiskDevFileds): Observable<MediaItem> {
    if (field === 'kinopoiskId') {
      return this.loadById(id);
    }

    return this.search({
      [field]: id
    } as FilmSearchParams).pipe(
      map(response => response.results[0]),
    );
  }

  loadById(kinopoiskId: number): Observable<MediaItem> {
    return this.requestSearch<KinopoiskDevDetails>([
      {
        field: KinopoiskDevFileds.kinopoiskId,
        search: kinopoiskId
      }
    ]).pipe(
      withLatestFrom(this.genreService.list$),
      map(([data, genres]) => this.mapDetail(data, genres)),
    )
  }

  search(params: FilmSearchParams, isTv = false): Observable<SearchRequestResultV2<MediaItem>> {
    const pageParams: Partial<KinopoiskDevPagination> = {
      limit: params?.limit || 100,
      page: params?.page || 1,
    }

    const fields: KinopoiskDevRequestSearch[] = [];

    Object.entries(params).filter(([key]) => !['limit', 'page'].includes(key)).forEach(([key, search]) => {
      fields.push({
        field: KinopoiskDevFileds[key],
        search
      })
    })

    const type = params.type === Types.films ? KinopoiskDevTypes.movie : undefined;

    if (type) {
      fields.push({
        field: 'type',
        search: type,
      })
    }

    const selectFields: string[] = [
      'externalId',
      'poster',
      'rating',
      'id',
      'type',
      'name',
      'description',
      'year',
      'alternativeName',
      'genres',
    ];

    if (isTv) {
      // selectFields.push('seasonsInfo')
    }

    return this.requestSearch<KinopoiskDevResponse>(fields, selectFields, pageParams).pipe(
      switchMap(res => this.mapDevResponse(res)),
    );
  }

  private mapDevResponse(response: KinopoiskDevResponse): Observable<SearchRequestResultV2<MediaItem>> {
    return this.genreService.list$.pipe(
      take(1),
      map(genres => response.docs.map(item => this.mapDetail(item, genres))),
      switchMap(list => this.libraryService.saveToRepository(list, 'kinopoiskId')),
      map(list => ({
        results: list,
        total: response.total,
        page: response.page,
        hasMore: response.page < response.pages,
      })),
    )
  }

  private parseImdb(id: string | null): number | undefined {
    if (!id) {
      return undefined;
    }

    return parseInt(id.replace('tt', ''));
  }

  private mapDetail(detail: KinopoiskDevShortItem, genres: Genre[]): Omit<MediaItem, 'id'> {
    const episodes = detail.seasonsInfo?.reduce((calc, it) => calc + it.episodesCount, 0) || 0;

    const url = detail.externalId?.kpHD
      ? `https://hd.kinopoisk.ru/?rt=` + detail.externalId.kpHD
      : (detail.externalId?.imdb ? `https://www.imdb.com/title/${detail.externalId.imdb}/` : '');

    const itemGenres = [];

    detail.genres?.forEach(({ name }) => {
      if (KINOPOISK_GENRES_MAP[name]) {
        itemGenres.push(KINOPOISK_GENRES_MAP[name]);
      } else {
        this.errorsService.addError({
          error: 'Kinopoisk genre not found'
        }, { name })
      }
    });

    return {
      title: detail.name,
      image: detail.poster?.previewUrl || EMPTY_POSTER,
      description: detail.description,
      episodes: episodes,
      popularity: detail.rating?.kp || detail.rating?.imdb || 0,
      year: detail.year,
      url,
      imdbId: this.parseImdb(detail.externalId?.imdb),
      kinopoiskId: detail.id,
      genreIds: this.genreService.prepareGenres(
        itemGenres,
        genres,
        'kinopoiskId',
        detail.genres
      ),
      originalTitle: detail.alternativeName,
      type: KINOPOISK_DEV_FILM_TYPE_MAP[detail.type],
    }
  }

  private requestSearch<T>(
    fields: KinopoiskDevRequestSearch[],
    selectFields: string[] = [],
    params: Partial<KinopoiskDevPagination> = {}
  ): Observable<T> {
    const searchParams = new URLSearchParams({
      ...params as unknown as Record<string, string>
    });

    fields.forEach(item => {
      searchParams.append(item.field, '' + item.search);
    })

    selectFields.forEach(field => {
      searchParams.append('selectFields', field);
    })

    return this.get<T>('movie', searchParams.toString())
  }

  private get<T>(api: string, paramsQuery = ''): Observable<T> {
    const url = this.endpoint + api + '?' + (paramsQuery || '');

    return this.httpService.get<T>(url, {
      headers: {
        'x-api-key': this.getToken(),
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'accept': 'application/json',
      },
    }).pipe(
      map(res => res.data),
    );
  }

  private getToken(): string {
    const random = Math.floor(Math.random() * this.tokens.length);
    return this.tokens[random];
  }
}
