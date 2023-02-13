import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { UserService } from './services/user.service';
import { UserResponse } from './interface';

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super();
  }

  async validate(token: string): Promise<UserResponse> {
    return this.userService.validateUser(token);
  }
}
