import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entites/user.entity";
import { UsersController } from "./users.controller";
import { UserArtistEntity } from "./entites/user-artist.entity";
import { UserSongsEntity } from "./entites/user-songs.entity";
import { UsersService } from "./services/users.service";

@Module({
   imports: [
      TypeOrmModule.forFeature([UserEntity, UserArtistEntity, UserSongsEntity]),
   ],
   controllers: [
      UsersController,
   ],
   providers: [
      UsersService
   ]
})
export class UsersModule {
}
