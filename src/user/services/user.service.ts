import { Injectable } from '@nestjs/common';
import { AuthParams, UserResponse } from '../interface';
import { Connection, Repository } from 'typeorm';
import { UserDto, UserEntity } from '../entites/user.entity';
import { UserTokenEntity } from '../entites/user-token.entity';
import { MailService } from './mail.service';
import { config } from '../../config/config';
import * as fs from 'fs';
import { format } from 'date-fns';

const crypto = require('crypto');
const path = require('path');

@Injectable()
export class UserService {
  private userRepository: Repository<UserEntity>;
  private tokenRepository: Repository<UserTokenEntity>;

  constructor(
    private connection: Connection,
    private mailService: MailService,
  ) {
    this.userRepository = this.connection.getRepository(UserEntity);
    this.tokenRepository = this.connection.getRepository(UserTokenEntity);
  }

  login({ email, password }: AuthParams): Promise<UserResponse | null> {
    if (!email || !password) {
      throw new Error('notFillData');
    }

    return this.userRepository.findOneBy({
      email,
      password: this.passwordHash(password),
    }).then(user => {
      if (!user) {
        throw new Error('notFound');
      }

      const token = this.generateToken();

      return this.tokenRepository.insert({
        userId: user.id,
        token,
      }).then(() => new UserDto(user, token));
    });
  }

  registration({ email, password }: AuthParams): Promise<UserResponse | null> {
    return this.userRepository.insert({
      email,
      password: this.passwordHash(password),
    }).then(({ identifiers }) => {
      const userId = +identifiers[0].id;
      const token = this.generateToken();

      return this.tokenRepository.insert({
        userId,
        token,
      }).then(() => ({ id: userId, email, token }));
    });
  }

  logout(user: UserResponse): Promise<void> {
    return this.tokenRepository.delete({ token: user.token }).then();
  }

  validateUser(token: string): Promise<UserResponse> {
    return this.userRepository
      .createQueryBuilder('users')
      .select('users.*')
      .innerJoin('user-token', 'ut', 'ut.userId=users.id')
      .where('ut.token=:token', { token })
      .printSql()
      .getRawOne<UserEntity>()
      .then(res => {

        if (!res) {
          throw new Error('notFoundUser');
        }

        this.tokenRepository.update({
          token,
        }, {
          date: format(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        });

        return new UserDto(res, token);
      });
  }

  resetPassword(resetHash: string): Promise<void> {
    return this.userRepository.findOne({
      where: {
        resetHash,
      },
    }).then(user => {
      if (!user) {
        throw new Error('notFound');
      }

      const password = this.makeRandomString(8);
      user.password = this.passwordHash(password);
      user.resetHash = null;

      return Promise.all([
        this.renderTemplate('new-password', {
          year: new Date().getFullYear(),
          password,
        }),
        this.userRepository.save(user),
        this.tokenRepository.delete({
          userId: user.id,
        }),
      ]).then(([html]) => this.mailService.sendEmail(
        user.email,
        `Новый пароль для сервиса WatchList`,
        html,
      ));
    });
  }

  sendResetPassword(email: string): Promise<void> {
    return this.userRepository.findOne({
      where: {
        email,
      },
    }).then((user) => {
      if (!user) {
        throw new Error('notFound');
      }

      const hash = this.makeRandomString(10);

      user.resetHash = hash;
      this.userRepository.save(user);

      return this.renderTemplate('password-reset', {
        year: new Date().getFullYear(),
        link: config.domain + '/user/reset/' + hash,
      }).then(html => {
        return this.mailService.sendEmail(
          email,
          'Сброс пароля для приложения WatchList',
          html,
        );
      });
    });
  }

  private renderTemplate(template: string, param: Object): Promise<string> {
    return new Promise((resolve, reject) => {
      const pathLink = path.resolve(__dirname, '../templates/' + template + '.html');
      fs.readFile(pathLink, null, (err, data) => {
        if (err) {
          reject(err);
        } else {
          let html = data.toString();
          Object.entries(param).forEach(([key, value]) => {
            html = html.replace(`{{${key}}}`, value);
          });
          resolve(html);
        }
      });
    });
  }

  private passwordHash(password: string): string {
    const shasum = crypto.createHash('sha1');
    shasum.user(password);
    return shasum.digest('hex');
  }

  private generateToken(): string {
    return this.makeRandomString(22);
  }

  private makeRandomString(length): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
