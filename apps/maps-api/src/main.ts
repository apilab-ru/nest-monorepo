import { Logger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { urlencoded, json } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { environment } from './environments/environment';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { AllExceptionsFilter } from '@utils/exceptions';
import * as fs from 'fs';

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string;
    }
  }
}
global.__rootdir__ = __dirname || process.cwd();

const SWAGGER_PUBLIC_PATH = 'swagger';

async function bootstrap() {
  const options: NestApplicationOptions = {};

  if (environment.ssl) {
    options.httpsOptions = {
      key: fs.readFileSync(environment.ssl.key, 'utf8'),
      cert: fs.readFileSync(environment.ssl.cert, 'utf8'),
    };
  }

  const app = await NestFactory.create(AppModule, options);

  const config = new DocumentBuilder()
    .setTitle('BSaberProxy')
    .addBearerAuth()
    .addServer(environment.prefix)
    .setBasePath(environment.prefix)
    .setVersion('1.1.3')
    .setDescription('')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.enableCors({});

  app.setGlobalPrefix(environment.prefix);

  const port = process.env.PORT || 3000;

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapter, !environment.production),
  );

  SwaggerModule.setup(
    environment.prefix + SWAGGER_PUBLIC_PATH,
    app,
    document,
    {},
  );

  await app.listen(port);

  const method = environment.ssl ? 'https' : 'http';

  Logger.log(
    `Application is running on: ${method}://localhost:${
      port + environment.prefix
    }/swagger`,
  );
}

bootstrap();
