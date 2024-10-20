import { AuthGuard } from '@nestjs/passport';

export class OptionalJwtAuthGuard extends AuthGuard() {
  // Override handleRequest so it never throws an error
  handleRequest(err, user, info, context) {
    return user;
  }
}
