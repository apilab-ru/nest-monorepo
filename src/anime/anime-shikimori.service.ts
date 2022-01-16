import { HttpService, Injectable } from '@nestjs/common';
import { AnimeSearchV2Query, ShikimoriDetailItem, ShikimoriGenre, ShikimoriItem } from './interface';
import { catchError, map, switchMap, take, tap, toArray } from 'rxjs/operators';
import { concat, from, Observable, of } from 'rxjs';
import { SentryService } from '../sentry/sentry.service';
import { URLSearchParams } from 'url';
import { GenreBase } from '../genres/interface';
import { MediaItem, SearchRequestResultV2 } from '../models';
import { Connection, Repository } from 'typeorm/index';
import { LibraryItemEntity } from '../library/entites/library-item.entity';
import { GenreService } from '../genres/genres.service';
import { Genre } from '../models/genre';

const domain = 'https://shikimori.one';
const api = domain + '/api/';
const defaultLimit = 20;

@Injectable()
export class AnimeShikimoriService {
  private repository: Repository<LibraryItemEntity>;
  private config = {
    headers: {
      'User-Agent': 'FileCab',
    },
  };

  constructor(
    private httpService: HttpService,
    private sentryService: SentryService,
    private genreService: GenreService,
    connection: Connection,
  ) {
    this.repository = connection.getRepository(LibraryItemEntity);
  }

  search(query: AnimeSearchV2Query): Observable<SearchRequestResultV2<MediaItem>> {
    const params = new URLSearchParams();
    if (query.name) {
      params.append('search', query.name);
    }
    params.append('limit', `${query.limit || defaultLimit}`);

    return this.httpService.get<ShikimoriItem[]>(api + 'animes?' + params.toString(), this.config).pipe(
      switchMap(({ data }) => {

        return concat(...data.map(item => this.getItemDetail(item.id))).pipe(
          toArray(),
        );
      }),
      catchError(error => {
        this.sentryService.captureException(error);

        return of([]);
      }),
      map(list => ({ results: list, page: query.page || 1 })),
    );
  }

  loadBaseGenres(): Observable<GenreBase[]> {
    return this.httpService.get<ShikimoriGenre[]>(api + 'genres', this.config).pipe(
      map(list => list.data.map(item => ({ name: item.russian, kind: item.kind }))),
    );
  }

  getItemDetail(id: number): Observable<MediaItem> {
    return from(this.repository.findOne({ id })).pipe(
      switchMap(item => item ? of(item) : this.loadDetail(id)),
    );
  }

  private loadDetail(id: number): Observable<MediaItem> {
    return this.httpService.get<ShikimoriDetailItem>(api + 'animes/' + id, this.config).pipe(
      switchMap(response => this.convertShikimoriToItem(response.data)),
      tap(item => {
        this.repository.insert(item)
          .catch(err => {

            this.sentryService.captureException({
              error: err,
              item: item,
            });
          });
      }),
    );
  }

  private convertShikimoriToItem(item: ShikimoriDetailItem): Observable<MediaItem> {
    return this.genreService.list$.pipe(
      take(1),
      map(genres => {
        return {
          shikimoriId: item.id,
          title: item.russian,
          image: domain + item.image.preview,
          description: item.description,
          episodes: item.episodes,
          genreIds: this.findGenres(item.genres, genres),
          originalTitle: item.name,
          popularity: parseFloat(item.score),
          year: parseInt(item.aired_on),
          type: item.kind,
          url: item.url,
        };
      }),
    );
  }

  private findGenres(itemList: ShikimoriGenre[], fullList: Genre[]): number[] {
    return this.genreService.findGenres(
      itemList.map(it => this.genreService.prepareName(it.russian)),
      fullList,
    );
  }
}
