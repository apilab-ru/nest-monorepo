import { Injectable } from '@nestjs/common';
import { RewriteFrames } from '@sentry/integrations';
import { init as sentryInit, captureException } from '@sentry/node';
import { config } from '../config/config';

@Injectable()
export class SentryService {
  init(): void {
    sentryInit({
      dsn: config.sentry.dns,
      integrations: [
        new RewriteFrames({
          root: global.__rootdir__,
        }),
      ],
    });
  }

  captureException(e: any): void {
    captureException(e);
    console.error('error', e);
  }
}
