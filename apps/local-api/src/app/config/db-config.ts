import { ConnectionOptions } from 'typeorm';
import { config } from './config';
import { SettingsEntity } from "@bsab/shared/settings/entites/settings.entity";
import { AuthorEntity } from "../parser/entites/author.entity";
import { TagEntity } from "@bsab/shared/maps/entites/tag.entity";
import { MapEntity } from "@bsab/shared/maps/entites/mapEntity";
import { ErrorEntity } from "@utils/exceptions/entities/error.entity";

export const DB_CONFIG: ConnectionOptions = {
  type: 'mysql',
  port: 3306,
  ...config.db,
  entities: [
     SettingsEntity,
     AuthorEntity,
     TagEntity,
     MapEntity,
     ErrorEntity,
  ],
  migrationsRun: false,
  synchronize: false,
  charset: 'utf8mb4',

  //logging: 'all'
};
