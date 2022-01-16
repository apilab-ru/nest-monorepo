import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { Anime, GenreOld, SearchRequestResult } from '../models';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnimeSearchQuery } from './interface';
import { firstValueFrom } from 'rxjs';

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
    required: false,
  })
  @ApiQuery({
    name: 'type',
    type: 'string',
    description: 'types separated by ","',
    required: false,
  })
  @ApiQuery({
    name: 'genre',
    type: 'string',
    description: 'genres separated by ","',
    required: false,
  })
  @ApiQuery({
    name: 'year',
    type: 'string',
    description: 'years separated by ","',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
  })
  async findAnime(@Query() query: AnimeSearchQuery): Promise<SearchRequestResult<Anime>> {
    return await firstValueFrom(this.animeService.search(query));
  }

  @Get('genres')
  async getGenres(): Promise<GenreOld[]> {
    return await firstValueFrom(this.animeService.getGenres());
  }

  @Get(':id')
  @ApiQuery({
    name: 'id',
    type: 'number',
  })
  async findById(@Param('id') id: string): Promise<Anime> {
    return await firstValueFrom(this.animeService.byId(+id));
  }
}
