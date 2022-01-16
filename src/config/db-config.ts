import { ConnectionOptions } from 'typeorm';
import { config } from './config';
import { GenreEntity } from '../genres/entites/genre.entity';
import { LibraryItemEntity } from '../library/entites/library-item.entity';
import { UserEntity } from '../user/entites/user.entity';
import { UserTokenEntity } from '../user/entites/user-token.entity';
import { UserLibraryEntity } from '../user-library/entites/user-library';

export const DB_CONFIG: ConnectionOptions = {
  type: 'mysql',
  port: 3306,
  ...config.db,
  entities: [GenreEntity, LibraryItemEntity, UserEntity, UserTokenEntity, UserLibraryEntity],
  migrationsRun: false,
  synchronize: false,
  charset: 'utf8mb4',
};
