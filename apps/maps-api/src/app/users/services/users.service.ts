import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { UserSongsEntity } from '../entites/user-songs.entity';
import { UserArtistEntity } from '../entites/user-artist.entity';
import { User, UserAuthParams, UserRegParams } from '@bsab/api/user/user';
import { UserEntity } from '@bsab/shared/auth/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private repositorySongs: Repository<UserSongsEntity>;
  private repositoryArtists: Repository<UserArtistEntity>;
  private repositoryUser: Repository<UserEntity>;

  constructor(connection: Connection) {
    this.repositorySongs = connection.getRepository(UserSongsEntity);
    this.repositoryArtists = connection.getRepository(UserArtistEntity);
    this.repositoryUser = connection.getRepository(UserEntity);
  }

  async updateUserSongs(
    songs: string[],
    userId: number,
  ): Promise<UserSongsEntity[]> {
    await this.repositorySongs
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId })
      .execute();

    const songsList = songs.map((song) => ({
      user_id: userId,
      song,
    }));

    return this.repositorySongs.save(songsList);
  }

  async updateUserArtists(
    artists: string[],
    userId: number,
  ): Promise<UserArtistEntity[]> {
    await this.repositoryArtists
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId })
      .execute();

    const entityList: Partial<UserArtistEntity>[] = artists.map((artist) => ({
      user_id: userId,
      artist,
    }));

    return this.repositoryArtists.save(entityList);
  }

  async registration(params: UserRegParams): Promise<User> {
    if (!params.email || !params.password) {
      throw new Error('notFillData');
    }

    return this.repositoryUser
      .findOneBy({
        email: params.email,
      })
      .then((user) => {
        if (user) {
          throw new Error('userAlreadyExisted');
        }

        return this.repositoryUser.save({
          ...params,
          password: this.passwordHash(params.password),
          token: this.generateToken(),
        });
      });
  }

  async login({ email, password }: UserAuthParams): Promise<User> {
    if (!email || !password) {
      throw new Error('notFillData');
    }

    return this.repositoryUser
      .findOneBy({
        email,
        password: this.passwordHash(password),
      })
      .then((user) => {
        if (!user) {
          throw new Error('notFound');
        }

        if (user.token) {
          return user;
        }

        user.token = this.generateToken();

        return this.repositoryUser.save(user);
      })
      .then((user) => {
        delete user.password;

        return user;
      });
  }

  private passwordHash(password: string): string {
    const shasum = crypto.createHash('sha1');
    shasum.update(password);
    return shasum.digest('hex');
  }

  // TODO share this code

  private generateToken(): string {
    return this.makeRandomString(22);
  }

  private makeRandomString(length): string {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
