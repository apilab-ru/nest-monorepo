import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { captureException } from '@sentry/node';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapter: ExpressAdapter) {
  }

  catch(exception: Error, host: ArgumentsHost): void {
    console.error('xxx catch', exception);

    const ctx = host.switchToHttp();

    const httpStatus = this.statusMapper(exception);

    const responseBody = {
      statusCode: httpStatus,
      error: exception.message,
    };

    this.httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private statusMapper(exception: Error): HttpStatus {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    switch (exception.message) {
      case 'notFound':
        return HttpStatus.NOT_FOUND;

      case 'notFoundUser':
        return HttpStatus.UNAUTHORIZED;

      default:
        if (/^([a-zA-Z]*)$/.test(exception.message)) {
          return HttpStatus.BAD_REQUEST;
        } else {
          captureException(exception);
          return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
  }
}
