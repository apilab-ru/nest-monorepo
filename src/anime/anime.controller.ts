import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { Anime, Genre, SearchRequestResult } from '../api';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnimeSearchQuery } from './interface';

@ApiTags('anime')
@Controller('anime')
export class AnimeController {

  constructor(
    private readonly animeService: AnimeService,
  ) {
  }

  @Get('search')
  @ApiQuery({
    name: 'name',
    type: 'string',
  })
  @ApiQuery({
    name: 'type',
    type: 'string',
    description: 'types separated by ","',
  })
  @ApiQuery({
    name: 'genre',
    type: 'string',
    description: 'genres separated by ","',
  })
  @ApiQuery({
    name: 'yearseason',
    type: 'string',
    description: 'years: from{-to}, 2019 or 2018-2019',
  })
  async findAnime(@Query() query: AnimeSearchQuery): Promise<SearchRequestResult<Anime>> {
    let chips = { ...query };
    delete chips.name;
    return await this.animeService.search(query.name, chips).toPromise();
  }

  @Get('genres')
  async getGenres(): Promise<Genre[]> {
    return await this.animeService.getGenres().toPromise();
  }

  @Get(':id')
  @ApiQuery({
    name: 'id',
    type: 'number',
  })
  async findById(@Param('id') id: string): Promise<Anime> {
    return await this.animeService.byId(id).toPromise();
  }
}
