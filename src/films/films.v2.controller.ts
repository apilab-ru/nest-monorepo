import { Controller, Get, Query } from '@nestjs/common';
import { FilmsService } from './films.service';
import { MediaItem, SearchRequest, SearchRequestResult, SearchRequestResultV2 } from '../models';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { EFilmsSortBy, EOrderType } from './interface';
import { firstValueFrom } from 'rxjs';

@ApiTags('films/v2')
@Controller('films/v2')
export class FilmsV2Controller {

  constructor(
    private filmsService: FilmsService,
  ) {
  }

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
  async findFilm(
    @Query() query: SearchRequest,
  ): Promise<SearchRequestResult<MediaItem>> {
    return await firstValueFrom(this.filmsService.searchMovieV2(query.name));
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
  async findTv(
    @Query() query,
  ): Promise<SearchRequestResultV2<MediaItem>> {
    const chips = { ...query };
    const orderField = chips.orderField;
    const orderType = chips.orderType;
    delete chips.name;
    delete chips.orderField;
    delete chips.orderType;

    return await firstValueFrom(this.filmsService.searchTvV2(
      query.name, chips, orderField, orderType,
    ));
  }

}
