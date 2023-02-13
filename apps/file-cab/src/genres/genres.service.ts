import { Injectable } from '@nestjs/common';
import { Repository, Connection } from 'typeorm';
import { GenreEntity } from './entites/genre.entity';
import { GenreBase } from './interface';
import { Genre } from '../models/genre';
import { from, map, Observable, of, shareReplay, startWith, Subject, switchMap, take, tap } from 'rxjs';
import { SentryService } from '../sentry/sentry.service';
import { GenreKind } from './const';

@Injectable()
export class GenreService {
  list$: Observable<Genre[]>;

  private refresh = new Subject<void>();
  private repository: Repository<GenreEntity>;

  constructor(
    connection: Connection,
    private sentryService: SentryService,
  ) {
    this.repository = connection.getRepository(GenreEntity);
    this.list$ = this.refresh.pipe(
      startWith(undefined),
      switchMap(() => from(this.loadList())),
      shareReplay(1),
    );
  }

  loadList(): Promise<Genre[]> {
    return this.repository.find();
  }

  setList(list: GenreBase[]): Promise<GenreEntity[]> {
    const listPrepared = list.map(item => ({ ...item, name: this.prepareName(item.name) }));

    return this.repository
      .find()
      .then(res => {
        listPrepared.forEach(item => {
          const oldEntity = res.find(it => it.name === item.name);
          if (oldEntity) {
            if (!oldEntity.kind.includes(item.kind)) {
              oldEntity.kind.push(item.kind);
            }
            if (item.smotretId) {
              oldEntity.smotretId = item.smotretId;
            }
            if (item.imdbId) {
              oldEntity.imdbId = item.imdbId;
            }
          } else {
            const newItem = new GenreEntity();
            newItem.name = item.name;
            newItem.kind = [item.kind];
            newItem.imdbId = item.imdbId;
            newItem.smotretId = item.smotretId;
            if (item.id) {
              newItem.id = item.id;
            }
            res.push(newItem);
          }
        });
        return this.repository.save(res);
      }).then(list => {
        this.refresh.next(undefined);
        return list;
      });
  }

  prepareName(name: string): string {
    return name.substr(0, 1).toUpperCase() + name.substr(1);
  }

  findGenres(itemList: string[], fullList: Genre[]): number[] {
    return itemList.map(name => {
      const item = fullList.find(dbItem => dbItem.name === name);

      if (!item) {
        this.sentryService.captureException({
          message: 'Anime genre not found',
          name: name,
        });
      }

      return item?.id;
    }).filter(it => !!it);
  }

  prepareGenres(originalList: number[], fullList: Genre[], key: keyof Genre): number[] {
    const response: number[] = [];
    originalList.forEach(item => {
      const id = fullList.find(genre => genre[key] === item)?.id;
      if (id) {
        response.push(id);
      } else if (item) {
        this.sentryService.captureException({
          message: 'Genre math error',
          key,
          item,
        });
      }
    });

    return response;
  }

  findGenresAsync(itemList: string[]): Observable<number[]> {
    return this.list$.pipe(
      take(1),
      switchMap(fullList => {
        const newItems: Omit<GenreEntity, 'id'>[] = [];
        const genreIds = itemList.map(name => {
          const item = fullList.find(dbItem => dbItem.name === name);

          if (!item) {
            newItems.push({
              name,
              kind: [GenreKind.anime],
              key: '',
            });
          }

          return item?.id;
        }).filter(it => !!it);

        if (!newItems.length) {
          return of(genreIds);
        }

        return from(this.repository.save(newItems)).pipe(
          tap(() => this.refresh.next()),
          map(newItems => {
            return [...genreIds, ...newItems.map(it => it.id)];
          }),
        );
      }),
    );
  }
}
