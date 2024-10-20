import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './sentry/all-exceptions-filter';
import { urlencoded, json } from 'express';
import { Logger } from '@nestjs/common';
import { environment } from './environments/environment';

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
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('FileCabinet')
    .addBearerAuth()
    .addServer(environment.prefix)
    .setBasePath(environment.prefix)
    .setVersion('1.2.1')
    .setDescription('')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.enableCors({});

  app.setGlobalPrefix(environment.prefix);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const port = environment.port;

  SwaggerModule.setup(
    environment.prefix + SWAGGER_PUBLIC_PATH,
    app,
    document,
    {},
  );

  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${
      port + environment.prefix
    }/swagger`,
  );
}

bootstrap();
