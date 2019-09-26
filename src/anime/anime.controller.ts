import { Controller, Get, Query } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { Genre } from '../api';

interface SearchQuery {
  name: string;
}

@Controller('anime')
export class AnimeController {

  constructor(
    private readonly animeService: AnimeService,
  ) {
  }

  @Get('search')
  async findFilm(@Query() query: SearchQuery): Promise<any> {
    return await this.animeService.search(query.name);
  }

  @Get('genres')
  async getGenres(): Promise<Genre[]> {
    return await this.animeService.getGenres().toPromise();
  }

}
