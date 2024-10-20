import { Module } from '@nestjs/common';
import { FilmsController } from './films/films.controller';
import { AnimeController } from './anime/anime.controller';
import { FilmsService } from './films/films.service';
import { AnimeService } from './anime/anime.service';
import { AnimeShikimoriService } from './anime/anime-shikimori.service';
import { SentryService } from './sentry/sentry.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_CONFIG } from './config/db-config';
import { GenreService } from './genres/genres.service';
import { GenresController } from './genres/genres.controller';
import { AnimeV2Controller } from './anime/anime.v2.controller';
import { UserController } from './user/user.controller';
import { UserService } from './user/services/user.service';
import { PassportModule } from '@nestjs/passport';
import { HttpStrategy } from './user/http.strategy';
import { LibraryService } from './library/library.service';
import { UserLibraryService } from './user-library/user-library.service';
import { UserLibraryController } from './user-library/user-library.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { MailService } from './user/services/mail.service';
import { FireBaseService } from './user/services/fire-base.service';
import { FilmsV2Controller } from './films/films.v2.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClassTransformInterceptor } from './sentry/class-transform.interceptor';
import { LibraryController } from './library/library-controller';
import { HttpModule } from '@nestjs/axios';
import { KinopoiskService } from './films/kinopoisk/kinopoisk.service';
import { MigrationService } from './library/migration.service';
import { KinopoiskDevService } from './films/kinopoisk-dev/kinopoisk-dev.service';
import { ErrorsService } from '@utils/exceptions/errors-service';
import { UtilsController } from './utils/utils.controller';
import { UtilsService } from './utils/utils.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(DB_CONFIG),
    PassportModule.register({ defaultStrategy: 'bearer' }),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [
    FilmsController,
    FilmsV2Controller,
    AnimeController,
    AnimeV2Controller,
    GenresController,
    UserController,
    UserLibraryController,
    LibraryController,
    UtilsController,
  ],
  providers: [
    FilmsService,
    KinopoiskService,
    KinopoiskDevService,
    AnimeService,
    AnimeShikimoriService,
    SentryService,
    GenreService,
    UserService,
    MailService,
    UserLibraryService,
    HttpStrategy,
    LibraryService,
    MigrationService,
    FireBaseService,
    ErrorsService,
    UtilsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassTransformInterceptor,
    },
  ],
})
export class AppModule {
  constructor(sentryService: SentryService) {
    sentryService.init();
  }
}
