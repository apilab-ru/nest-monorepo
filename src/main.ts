import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { urlencoded, json } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { environment } from './environments/environment';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
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
         cert: fs.readFileSync(environment.ssl.cert, 'utf8')
      }
   }

   const app = await NestFactory.create(AppModule, options);

   const config = new DocumentBuilder()
      .setTitle('BSaberProxy')
      .addBearerAuth()
      .setVersion('1.1.1')
      .setVersion('1.0')
      .setDescription('')
      .build();
   const document = SwaggerModule.createDocument(app, config);

   SwaggerModule.setup(SWAGGER_PUBLIC_PATH, app, document);

   app.use(json({ limit: '50mb' }));
   app.use(urlencoded({ extended: true, limit: '50mb' }));

   app.enableCors({});

   const globalPrefix = '';
   app.setGlobalPrefix(globalPrefix);
   const port = process.env.PORT || 3000;
   await app.listen(port);

   const method = environment.ssl ? 'https' : 'http';

   Logger.log(
      `Application is running on: ${ method }://localhost:${ port }/swagger`
   );
}

bootstrap();
