import { Controller, Get, Query } from '@nestjs/common';
import { FilmsService } from './films.service';
import {
  FilmSearchParams,
  MediaItem,
  SearchRequestResult,
  SearchRequestResultV2,
} from '@filecab/models';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { EFilmsSortBy, EOrderType } from './interface';
import { firstValueFrom } from 'rxjs';
import { KinopoiskDevService } from './kinopoisk-dev/kinopoisk-dev.service';
import { Types } from '@filecab/models/types';

@ApiTags('films/v2')
@Controller('films/v2')
export class FilmsV2Controller {
  constructor(
    private filmsService: FilmsService,
    private kinopoiskService: KinopoiskDevService,
  ) {}

  @Get('movie')
  @ApiQuery({
    name: 'name',
    type: 'string',
    required: false,
  })
  /*@ApiQuery({
    name: 'orderField',
    type: 'enum',
    enum: Object.values(EFilmsSortBy),
    required: false,
  })
  @ApiQuery({
    name: 'orderType',
    type: 'enum',
    enum: Object.values(EOrderType),
    required: false,
  })*/
  /*@ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })*/
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'year',
    type: 'string',
    description: 'years separated by ",", for negative add!',
    required: false,
  })
  @ApiQuery({
    name: 'genre',
    type: 'string',
    description: 'genres separated by ",", for negative add!',
    required: false,
  })
  @ApiQuery({
    name: 'kinopoiskId',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'imdbId',
    type: 'number',
    required: false,
  })
  async findFilm(
    @Query() query: FilmSearchParams,
  ): Promise<SearchRequestResult<MediaItem>> {
    return await firstValueFrom(
      this.kinopoiskService.search({
        ...query,
        type: Types.films,
      }),
    );
  }

  @Get('tv')
  @ApiQuery({
    name: 'name',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'orderField',
    type: 'enum',
    enum: Object.values(EFilmsSortBy),
    required: false,
  })
  @ApiQuery({
    name: 'orderType',
    type: 'enum',
    enum: Object.values(EOrderType),
    required: false,
  })
  @ApiQuery({
    name: 'primary_release_year',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'with_genres',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'with_people',
    type: 'string',
    required: false,
  })
  async findTv(@Query() query): Promise<SearchRequestResultV2<MediaItem>> {
    return await firstValueFrom(
      this.kinopoiskService.search(
        {
          ...query,
        },
        true,
      ),
    );
  }
}
