import { ConnectionOptions } from 'typeorm';
import { config } from './config';
import { MapEntity } from '@bsab/shared/maps/entites/mapEntity';
import { TagEntity } from '@bsab/shared/maps/entites/tag.entity';
import { ErrorEntity } from '@utils/exceptions/entities/error.entity';
import { USER_ENTITES } from "../users/entites";
import { UserMapShowEntity } from "@bsab/shared/maps/entites/userMapShowEntity";
import { AuthorEntity } from "../parser/entites/author.entity";
import { SettingsEntity } from "@bsab/shared/settings/entites/settings.entity";

export const DB_CONFIG: ConnectionOptions = {
   type: 'mysql',
   port: 3306,
   ...config.db,
   entities: [
      MapEntity,
      UserMapShowEntity,
      TagEntity,
      AuthorEntity,
      ErrorEntity,
      SettingsEntity,
      ...USER_ENTITES,
   ],
   migrationsRun: false,
   synchronize: false,
   charset: 'utf8mb4',

   //logging: 'all'
};
