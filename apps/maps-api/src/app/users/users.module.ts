import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@bsab/shared/auth/entities/user.entity';
import { UsersController } from './users.controller';
import { UserArtistEntity } from './entites/user-artist.entity';
import { UserSongsEntity } from './entites/user-songs.entity';
import { UsersService } from './services/users.service';
import { AuthModule } from '@bsab/shared/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserArtistEntity, UserSongsEntity]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
