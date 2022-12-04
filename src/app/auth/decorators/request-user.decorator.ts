import { createParamDecorator } from '@nestjs/common';
import { UserEntity } from '../../users/entites/user.entity';

export const RequestUser = createParamDecorator((_: any, req): UserEntity => {

   return req.user;
});
