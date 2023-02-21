import { ConnectionOptions } from 'typeorm';
import { config } from './config';
import { MapOldEntity } from '../parser/entites/mapOldEntity';
import { GenreEntity } from '../parser/entites/genre.entity';
import { MapEntity } from '../maps/entites/mapEntity';
import { TagEntity } from '../maps/entites/tag.entity';
import { AuthorEntity } from '../parser/entites/author.entity';
import { SettingsEntity } from '../settings/entites/settings.entity';
import { ErrorEntity } from '@utils/exceptions/entities/error.entity';
import { USER_ENTITES } from "../users/entites";

export const DB_CONFIG: ConnectionOptions = {
   type: 'mysql',
   port: 3306,
   ...config.db,
   entities: [
      MapOldEntity,
      GenreEntity,
      MapEntity,
      TagEntity,
      AuthorEntity,
      SettingsEntity,
      ErrorEntity,
      ...USER_ENTITES,
   ],
   migrationsRun: false,
   synchronize: false,
   charset: 'utf8mb4',

   //logging: 'all'
};
