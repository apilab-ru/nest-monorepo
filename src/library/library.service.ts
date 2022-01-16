import { Injectable } from '@nestjs/common';
import { Connection, In, Repository } from 'typeorm/index';
import { LibraryItemEntity, MediaItemDTO } from './entites/library-item.entity';
import { SentryService } from '../sentry/sentry.service';
import { MediaItem } from './interface';
import { Observable } from 'rxjs';

@Injectable()
export class LibraryService {
  private repository: Repository<LibraryItemEntity>;

  constructor(
    private sentryService: SentryService,
    connection: Connection,
  ) {
    this.repository = connection.getRepository(LibraryItemEntity);
  }

  private updateExistedItems(
    existed: LibraryItemEntity[],
    list: Partial<LibraryItemEntity>[],
    filedId: keyof MediaItem = 'id',
  ): LibraryItemEntity[] {
    existed.forEach(exItem => {
      const item = list.find(it => it[filedId] === exItem[filedId]);

      Object.keys(item)
        .filter(key => item[key])
        .forEach(key => {
          exItem[key] = item[key];
        });

      exItem.processed = item.processed || false;
    });

    return existed;
  }

  saveToRepository(list: Partial<LibraryItemEntity>[], filedId: keyof MediaItem = 'id'): Promise<LibraryItemEntity[]> {
    if (!list.length) {
      return Promise.resolve([]);
    }

    return this.repository.find({
      where: {
        [filedId]: In(list.map(it => it[filedId])),
      },
    }).then(existed => {
      const existedListIds = existed.map(it => it[filedId]);
      this.updateExistedItems(existed, list, filedId);

      return [
        ...existed,
        ...list.filter(it => !existedListIds.includes(it[filedId])),
      ];
    })
      .then(newList => this.repository.save(newList))
      .catch(error => {
        this.sentryService.captureException(error);
        throw new Error(error);
      });
  }

  loadByIds(ids: (number | string)[], fieldId: keyof MediaItem = 'id'): Promise<MediaItem[]> {
    return this.repository.find({
      where: {
        [fieldId]: In(ids),
      },
    }).then(list => {
      return list.map(it => new MediaItemDTO(it));
    });
  }

  loadNeedUpdateItem(): Promise<LibraryItemEntity | null> {
    return this.repository.findOne({
      where: {
        processed: true,
      },
    });
  }

  updateItem(entity: LibraryItemEntity, item: Partial<MediaItem>): Promise<LibraryItemEntity> {
    Object.entries(item).forEach(([key, value]) => {
      entity[key] = value;
    });
    entity.processed = false;

    console.log('xxx entity', entity);

    return this.repository.save(entity);
  }

}
