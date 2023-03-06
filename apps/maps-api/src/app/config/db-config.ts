import { ConnectionOptions } from 'typeorm';
import { config } from './config';
import { MapEntity } from '@bsab/shared/maps/entites/mapEntity';
import { TagEntity } from '@bsab/shared/maps/entites/tag.entity';
import { ErrorEntity } from '@utils/exceptions/entities/error.entity';
import { USER_ENTITES } from "../users/entites";
import { UserMapShowEntity } from "@bsab/shared/maps/entites/userMapShowEntity";

export const DB_CONFIG: ConnectionOptions = {
  type: 'mysql',
  port: 3306,
  ...config.db,
  entities: [
    MapEntity,
    UserMapShowEntity,
    TagEntity,

    ErrorEntity,
    ...USER_ENTITES,
  ],
  migrationsRun: false,
  synchronize: false,
  charset: 'utf8mb4',

  //logging: 'all'
};
