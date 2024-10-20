import { ConnectionOptions } from 'typeorm';
import { config } from './config';
import { MapEntity } from '@bsab/shared/maps/entites/mapEntity';
import { TagEntity } from '@bsab/shared/maps/entites/tag.entity';
import { ErrorEntity } from '@utils/exceptions/entities/error.entity';
import { USER_ENTITIES } from '../users/entites';
import { UserMapShowEntity } from '@bsab/shared/maps/entites/userMapShowEntity';
import { SettingsEntity } from '@bsab/shared/settings/entites/settings.entity';
import { PARSER_ENTITIES } from '../parser/entites';

export const DB_CONFIG: ConnectionOptions = {
  type: 'mysql',
  port: 3306,
  ...config.db,
  entities: [
    MapEntity,
    UserMapShowEntity,
    TagEntity,
    ErrorEntity,
    SettingsEntity,
    ...PARSER_ENTITIES,
    ...USER_ENTITIES,
  ],
  migrationsRun: false,
  synchronize: false,
  charset: 'utf8mb4',

  //logging: 'all'
};
