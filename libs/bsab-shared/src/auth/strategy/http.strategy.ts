import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy) {
   constructor(
      private authService: AuthService,
   ) {
      super();
   }

   async validate(token: string, ...params): Promise<UserEntity> {
      /*if (environment.autoAuthUser) {
         return this.authService.byId(environment.autoAuthUser);
      }*/

      return this.authService.validateUser(token);
   }
}
