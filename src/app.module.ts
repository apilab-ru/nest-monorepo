import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilmsController } from './films/films.controller';
import { AnimeController } from './anime/anime.controller';
import { FilmsService } from './films/films.service';
import { AnimeService } from './anime/anime.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController, FilmsController, AnimeController],
  providers: [AppService, FilmsService, AnimeService],
})
export class AppModule {}
