import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { FilmsService } from '../films/films.service';
import { AnimeShikimoriService } from '../anime/anime-shikimori.service';
import { GenreService } from './genres.service';
import { combineLatest } from 'rxjs';
import { AnimeService } from '../anime/anime.service';
import { Genre } from '../models/genre';

@ApiTags('genres')
@Controller('genres')
export class GenresController {
  constructor(
    private filmService: FilmsService,
    private animeService: AnimeService,
    private animeV2Service: AnimeShikimoriService,
    private genreService: GenreService,
  ) {
  }

  @Get('refresh')
  refresh(): Promise<string> {
    return combineLatest([
      this.filmService.loadBaseGenres(),
      this.animeService.loadBaseGenres(),
      this.animeV2Service.loadBaseGenres(),
    ]).toPromise()
      .then(([filmsList, animeList]) => this.genreService.setList([
        ...filmsList,
        ...animeList,
      ])).then((list) => {
        return 'success total: ' + list.length;
      });
  }

  @Get('list')
  getList(): Promise<Genre[]> {
    return this.genreService.loadList();
  }
}
