import { Injectable } from '@nestjs/common';
import { Connection, In, Repository } from 'typeorm';
import { LibraryItemEntity, MediaItemDTO } from './entites/library-item.entity';
import { SentryService } from '../sentry/sentry.service';
import { MediaItem } from '@filecab/models';

const UPDATE_FIELDS: Partial<keyof MediaItem>[] = ['episodes', 'genreIds'];

@Injectable()
export class LibraryService {
  private repository: Repository<LibraryItemEntity>;

  constructor(private sentryService: SentryService, connection: Connection) {
    this.repository = connection.getRepository(LibraryItemEntity);
  }

  private updateExistedItems(
    existed: LibraryItemEntity[],
    list: Partial<LibraryItemEntity>[],
    filedId: keyof MediaItem = 'id',
  ): LibraryItemEntity[] {
    existed.forEach((exItem, index) => {
      const item = list.find((it) => it[filedId] === exItem[filedId])!;

      UPDATE_FIELDS.forEach((field) => {
        if (item[field]) {
          // @ts-ignore
          existed[index][field] = item[field];
        }
      });
    });

    return existed;
  }

  saveToRepository(
    list: Partial<LibraryItemEntity>[],
    filedId: keyof MediaItem = 'id',
  ): Promise<LibraryItemEntity[]> {
    if (!list.length) {
      return Promise.resolve([]);
    }

    return this.repository
      .find({
        where: {
          [filedId]: In(list.map((it) => it[filedId])),
        },
      })
      .then((existed) => {
        const existedListIds = existed.map((it) => it[filedId]);
        this.updateExistedItems(existed, list, filedId);

        return [
          ...existed,
          ...list.filter((it) => !existedListIds.includes(it[filedId])),
        ];
      })
      .then((newList) => this.repository.save(newList))
      .catch((error) => {
        this.sentryService.captureException(error);
        throw new Error(error);
      });
  }

  loadByIds(
    ids: (number | string)[],
    fieldId: keyof MediaItem = 'id',
  ): Promise<MediaItem[]> {
    return this.repository
      .find({
        where: {
          [fieldId]: In(ids),
        },
      })
      .then((list) => {
        return list.map((it) => new MediaItemDTO(it));
      });
  }
}
