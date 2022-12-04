import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { UserEntity } from '../../users/entites/user.entity';
import { environment } from "../../../environments/environment";

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy) {
   constructor(private authService: AuthService) {
      super();
   }

   async validate(token: string, ...params): Promise<UserEntity> {
      console.log('xxx validate', token, params);

      if (environment.autoAuthUser) {
         return this.authService.byId(environment.autoAuthUser);
      }

      return this.authService.validateUser(token);
   }
}
