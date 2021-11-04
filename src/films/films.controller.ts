import { Controller, Get, Query } from '@nestjs/common';
import { FilmsService } from './films.service';
import { Film, Genre, SearchRequestResult } from '../api';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { EFilmsSortBy, EOrderType } from './interface';

@ApiTags('films')
@Controller('films')
export class FilmsController {

  constructor(
    private filmsService: FilmsService,
  ) {
  }

  @Get('movie')
  @ApiQuery({
    name: 'name',
    type: 'string',
  })
  @ApiQuery({
    name: 'orderField',
    type: 'enum',
    enum: Object.values(EFilmsSortBy),
  })
  @ApiQuery({
    name: 'orderType',
    type: 'enum',
    enum: Object.values(EOrderType),
  })
  @ApiQuery({
    name: 'primary_release_year',
    type: 'string',
  })
  @ApiQuery({
    name: 'with_genres',
    type: 'string',
  })
  @ApiQuery({
    name: 'with_people',
    type: 'string',
  })
  async findFilm(
    @Query() query,
  ): Promise<SearchRequestResult<Film>> {
    const chips = { ...query };
    const orderField = chips.orderField;
    const orderType = chips.orderType;
    delete chips.name;
    delete chips.orderField;
    delete chips.orderType;
    return await this.filmsService.searchMovie(
      query.name, chips, orderField, orderType,
    ).toPromise();
  }

  @Get('tv')
  @ApiQuery({
    name: 'name',
    type: 'string',

  })
  @ApiQuery({
    name: 'orderField',
    type: 'enum',
    enum: Object.values(EFilmsSortBy),

  })
  @ApiQuery({
    name: 'orderType',
    type: 'enum',
    enum: Object.values(EOrderType),

  })
  @ApiQuery({
    name: 'primary_release_year',
    type: 'string',

  })
  @ApiQuery({
    name: 'with_genres',
    type: 'string',

  })
  @ApiQuery({
    name: 'with_people',
    type: 'string',

  })
  async findTv(
    @Query() query,
  ): Promise<SearchRequestResult<Film>> {
    const chips = { ...query };
    const orderField = chips.orderField;
    const orderType = chips.orderType;
    delete chips.name;
    delete chips.orderField;
    delete chips.orderType;
    return await this.filmsService.searchTv(
      query.name, chips, orderField, orderType,
    ).toPromise();
  }

  @Get('genres')
  async loadGenres(): Promise<Genre[]> {
    return await this.filmsService.getGenres().toPromise();
  }

}
