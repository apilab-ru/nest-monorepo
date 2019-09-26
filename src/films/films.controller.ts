import { Controller, Get, Query } from '@nestjs/common';
import { FilmsService } from './films.service';
import { Film, SearchRequestResult, Genre } from '../api';

interface FilmsSearchQuery {
  name: string;
}

@Controller('films')
export class FilmsController {

  constructor(
    private filmsService: FilmsService,
  ) {
  }

  @Get('movie')
  async findFilm(@Query() query: FilmsSearchQuery): Promise<SearchRequestResult<Film>> {
    return await this.filmsService.searchMovie(query.name).toPromise();
  }

  @Get('tv')
  async findTv(@Query() query: FilmsSearchQuery): Promise<SearchRequestResult<Film>> {
    return await this.filmsService.searchTv(query.name).toPromise();
  }

  @Get('genres')
  async loadGenres(): Promise<Genre[]> {
    return await this.filmsService.getGenres().toPromise();
  }

}
