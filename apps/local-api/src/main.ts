/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { NestApplicationOptions } from "@nestjs/common/interfaces/nest-application-options.interface";

import fs from "fs";
import { environment } from "./environments/environment";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "express";
import { AllExceptionsFilter } from "@utils/exceptions";

const SWAGGER_PUBLIC_PATH = 'swagger';

async function bootstrap() {
   const options: NestApplicationOptions = {};

   options.httpsOptions = {
      key: fs.readFileSync(environment.ssl.key, 'utf8'),
      cert: fs.readFileSync(environment.ssl.cert, 'utf8')
   }

   const app = await NestFactory.create(AppModule, options);

   const config = new DocumentBuilder()
      .setTitle('BSaberLocal')
      .addBearerAuth()
      .setVersion(environment.version)
      .setDescription('')
      .build();

   const document = SwaggerModule.createDocument(app, config);

   SwaggerModule.setup(SWAGGER_PUBLIC_PATH, app, document);

   app.use(json({ limit: '50mb' }));
   app.use(urlencoded({ extended: true, limit: '50mb' }));

   app.enableCors({});

   const globalPrefix = '';
   app.setGlobalPrefix(globalPrefix);

   const port = process.env.PORT || environment.port;
   const { httpAdapter } = app.get(HttpAdapterHost);

   app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
   await app.listen(port);

   const method = environment.ssl ? 'https' : 'http';

   Logger.log(
      `Application is running on: ${ method }://localhost:${port}/${SWAGGER_PUBLIC_PATH}`,
   );
}

bootstrap();
