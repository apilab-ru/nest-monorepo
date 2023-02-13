import { Injectable } from "@nestjs/common";
import { Connection, Repository } from "typeorm";
import { UserSongsEntity } from "../entites/user-songs.entity";
import { UserArtistEntity } from "../entites/user-artist.entity";

@Injectable()
export class UsersService {
   private repositorySongs: Repository<UserSongsEntity>;
   private repositoryArtists: Repository<UserArtistEntity>;

   constructor(
      connection: Connection,
   ) {
      this.repositorySongs = connection.getRepository(UserSongsEntity);
      this.repositoryArtists = connection.getRepository(UserArtistEntity);
   }

   async updateUserSongs(songs: string[], userId = 1): Promise<UserSongsEntity[]> {
      await this.repositorySongs.createQueryBuilder()
         .delete()
         .where('user_id = :userId', { userId })
         .execute();

      const songsList = songs.map(song => ({
         user_id: userId,
         song
      }));

      return this.repositorySongs.save(songsList);
   }

   async updateUserArtists(artists: string[], userId = 1): Promise<UserArtistEntity[]> {
      await this.repositoryArtists.createQueryBuilder()
         .delete()
         .where('user_id = :userId', { userId })
         .execute();

      const entityList: Partial<UserArtistEntity>[] = artists.map(artist => ({
         user_id: userId,
         artist
      }));

      return this.repositoryArtists.save(entityList);
   }
}
