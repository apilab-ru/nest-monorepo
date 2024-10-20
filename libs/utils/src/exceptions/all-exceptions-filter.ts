import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { captureException } from '@sentry/node';
import { AbstractHttpAdapter } from '@nestjs/core/adapters/http-adapter';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapter: AbstractHttpAdapter,
    private readonly isDev?: boolean,
  ) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const httpStatus = this.statusMapper(exception);

    if (this.isDev) {
      console.error(exception);
    } else {
      console.error(exception.message);
    }

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

    if (exception.message.includes('no such file')) {
      return HttpStatus.NOT_FOUND;
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
