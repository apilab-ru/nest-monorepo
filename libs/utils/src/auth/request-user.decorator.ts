import { createParamDecorator } from '@nestjs/common';

export const RequestUser = createParamDecorator((_: any, req): any => {
  console.log('xxx req', req, _);

  return req.user;
});
