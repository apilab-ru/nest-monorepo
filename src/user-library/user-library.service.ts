import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm/index';
import { UserLibraryEntity } from './entites/user-library';
import { Library, LibraryFlatData, LibraryItem, Tag } from '../library/interface';
import { LibraryService } from '../library/library.service';
import { GenreService } from '../genres/genres.service';
import { FireBaseService } from '../user/services/fire-base.service';
import { FIREBASE_EVENT_TABLE } from '../models';

@Injectable()
export class UserLibraryService {
  isNotified = true;
  private userLibraryRepository: Repository<UserLibraryEntity>;

  constructor(
    private connection: Connection,
    private libraryService: LibraryService,
    private genreService: GenreService,
    private fireBaseService: FireBaseService,
  ) {
    this.userLibraryRepository = this.connection.getRepository(UserLibraryEntity);
  }

  postList(userId: number, library: Library): Promise<void> {
    return this.userLibraryRepository.findOne({
      where: {
        userId,
      },
    }).then(res => {
      const entity = res || new UserLibraryEntity();
      entity.userId = userId;
      entity.data = this.flatData(library.data);
      entity.tags = library.tags;

      return this.userLibraryRepository.save(entity);
    }).then(() => {
      const animeList = library.data.anime.map(({ item }) => {
        delete item.id;
        return {
          ...item,
          processed: true,
        };
      });

      const tvList = library.data.tv.map(({ item }) => {
        delete item.id;
        return {
          ...item,
          processed: true,
        };
      });

      const filmsList = library.data.films.map(({ item }) => {
        delete item.id;
        return {
          ...item,
          processed: true,
        };
      });

      return Promise.all([
        this.libraryService.saveToRepository(
          animeList,
          'smotretId',
        ),
        this.libraryService.saveToRepository(
          tvList,
          'imdbId',
        ),
        this.libraryService.saveToRepository(
          filmsList,
          'imdbId',
        ),
      ]);
    }).then(() => {
      this.fireBaseService.updateValue(FIREBASE_EVENT_TABLE, {
        [userId]: new Date().getTime(),
      });
    });
  }

  loadList(userId: number): Promise<Library> {
    return this.userLibraryRepository.findOne({
      where: {
        userId,
      },
    }).then(res => {
      if (!res) {
        return {
          tags: [],
          data: {
            anime: [],
            films: [],
            tv: [],
          },
        };
      }

      return this.loadDataItems(res.data).then(data => ({
        tags: res.tags,
        data,
      }));
    });
  }

  emitUpdateToAllUsers(): void {
    if (this.isNotified) {
      return;
    }

    this.userLibraryRepository.find().then(list => {
      const date = new Date().getTime();
      const data = list.reduce((obj, item) => {
        obj[item.userId] = date;
        return obj;
      }, {});
      this.fireBaseService.updateValue(FIREBASE_EVENT_TABLE, data);
    });
  }

  private addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private loadDataItems(data: Record<string, LibraryFlatData[]>): Promise<Record<string, LibraryItem[]>> {
    return Promise.all([
      this.libraryService.loadByIds(
        data.anime.map(it => it.item.smotretId),
        'smotretId',
      ),
      this.libraryService.loadByIds(
        [...data.tv.map(it => it.item.imdbId), ...data.films.map(it => it.item.imdbId)],
        'imdbId',
      ),
    ]).then(([anime, films]) => {
      const animeMap = anime.reduce((ob, it) => {
        ob[it.smotretId] = it;
        return ob;
      }, {});

      const filmsMap = films.reduce((ob, it) => {
        ob[it.imdbId] = it;
        return ob;
      }, {});

      return {
        anime: data.anime.map(item => ({ ...item, item: animeMap[item.item.smotretId] })).filter(it => it.item),
        films: data.films.map(item => ({ ...item, item: filmsMap[item.item.imdbId] })).filter(it => it.item),
        tv: data.tv.map(item => ({ ...item, item: filmsMap[item.item.imdbId] })).filter(it => it.item),
      };
    });
  }

  private flatData(data: Record<string, LibraryItem[]>): Record<string, LibraryFlatData[]> {
    return {
      anime: data.anime.map(it => ({ ...it, item: { smotretId: it.item.smotretId } })),
      films: data.films.map(it => ({ ...it, item: { imdbId: it.item.imdbId } })),
      tv: data.tv.map(it => ({ ...it, item: { imdbId: it.item.imdbId } })),
    };
  }
}
