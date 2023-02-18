import { Injectable } from "@nestjs/common";
import { config } from '../../config/config';
import { concat, from, map, Observable, switchMap } from "rxjs";
import { MediaItem, SearchRequestResultV2 } from "@filecab/models";
import { HttpService } from "@nestjs/axios";
import { GenreService } from "../../genres/genres.service";
import { LibraryService } from "../../library/library.service";
import { KINOPOISK_DEV_FILM_TYPE_MAP, KinopoiskDevFileds, KinopoiskDevTypes } from "./const";
import { FilmSearchParams } from "../interface";
import {
  KinopoiskDevDetails,
  KinopoiskDevPagination,
  KinopoiskDevRequestSearch,
  KinopoiskDevResponse
} from "./interface";
import { FilmsKinopoiskService } from "../kinopoisk/films-kinopoisk.service";
import { toArray, withLatestFrom } from "rxjs/operators";
import { Genre } from "@filecab/models/genre";
import { KINOPOISK_GENRES_MAP } from "../kinopoisk/const";
import { Types } from "@filecab/models/types";

@Injectable()
export class KinopoiskDevService {
  private endpoint = 'https://test-api.kinopoisk.dev/';
  private token = config.films.kinopoiskDev;

  constructor(
    private httpService: HttpService,
    private genreService: GenreService,
    private libraryService: LibraryService,
    private filmsKinopoiskService: FilmsKinopoiskService,
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

  search(params: FilmSearchParams): Observable<SearchRequestResultV2<MediaItem>> {
    const pageParams: Partial<KinopoiskDevPagination> = {
      limit: params?.limit || 10,
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

    fields.push({
      field: 'type',
      search: type,
    })

    return this.requestSearch<KinopoiskDevResponse>(fields, pageParams).pipe(
      switchMap(res => this.mapDevResponse(res)),
    );
  }

  private mapDevResponse(response: KinopoiskDevResponse): Observable<SearchRequestResultV2<MediaItem>> {
    const ids =  response.docs.map(item => item.id);

    return from(this.libraryService.loadByIds(ids, 'kinopoiskId')).pipe(
      switchMap(exsisted => {
        const existedIds = exsisted.map(item => item.kinopoiskId);
        const newItems = ids.filter(id => !existedIds.includes(id));

        return concat<MediaItem[]>(
          ...newItems.map(id => this.loadById(id)),
        ).pipe(
          toArray(),
          switchMap(list => this.libraryService.saveToRepository(list, 'imdbId')),
          map(newItems => [...exsisted, ...newItems])
        )
      }),
      map(list => ({
        results: list,
        total: response.total,
        page: response.page,
        hasMore: response.page < response.pages,
      })),
    );
  }

  private parseImdb(id: string | null): number | undefined {
    if (!id) {
      return undefined;
    }

    return parseInt(id.replace('tt', ''));
  }

  private mapDetail(detail: KinopoiskDevDetails, genres: Genre[]): Omit<MediaItem, 'id'> {
    const episodes = detail.seasonsInfo.reduce((calc, it) => calc + it.episodesCount, 0);

    const url = detail.externalId.kpHD ? `https://hd.kinopoisk.ru/?rt=` + detail.externalId.kpHD : '';

    return {
      title: detail.name,
      image: detail.poster.previewUrl,
      description: detail.description,
      episodes: episodes,
      popularity: detail.rating.kp || detail.rating.imdb,
      year: detail.year,
      url,
      imdbId: this.parseImdb(detail.externalId.imdb),
      kinopoiskId: detail.id,
      genreIds: this.genreService.prepareGenres(
        detail.genres.map(({ name }) => KINOPOISK_GENRES_MAP[name], genres),
        genres,
        'kinopoiskId',
      ),
      originalTitle: detail.alternativeName,
      type: KINOPOISK_DEV_FILM_TYPE_MAP[detail.type],
    }
  }

  private requestSearch<T>(fields: KinopoiskDevRequestSearch[], params: Partial<KinopoiskDevPagination> = {}): Observable<T> {
    const searchParams = new URLSearchParams({
      ...params as unknown as Record<string, string>
    });

    fields.forEach(item => {
      searchParams.append(item.field, '' + item.search);
    })

    return this.get<T>('movie', searchParams.toString())
  }

  private get<T>(api: string, paramsQuery = ''): Observable<T> {
    const url = this.endpoint + api + '?token=' + this.token + (paramsQuery ? ('&' + paramsQuery) : '');

    return this.httpService.get<T>(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'accept': 'application/json',
      },
    }).pipe(
      map(res => res.data),
    );
  }
}
