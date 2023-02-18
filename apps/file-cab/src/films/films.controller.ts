import { Controller, Get, Query } from '@nestjs/common';
import { FilmsService } from './films.service';
import { Film, GenreOld, SearchRequestResult } from '@filecab/models';
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
  async loadGenres(): Promise<GenreOld[]> {
    return await this.filmsService.getGenres().toPromise();
  }

}
