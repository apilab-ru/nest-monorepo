import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  SearchRequest,
  SearchRequestResultV2,
  MediaItem,
  AnimeSearchV2Query,
} from '@filecab/models';
import { firstValueFrom } from 'rxjs';
import { AnimeService } from './anime.service';

@ApiTags('anime/v2')
@Controller('anime/v2')
export class AnimeV2Controller {
  constructor(private readonly animeService: AnimeService) {}

  @Get('search')
  @ApiQuery({
    name: 'name',
    type: 'string',
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
  async findAnimeV2(
    @Query() query: AnimeSearchV2Query,
  ): Promise<SearchRequestResultV2<MediaItem>> {
    return firstValueFrom(this.animeService.searchV2(query));
  }

  @Get(':id')
  @ApiQuery({
    name: 'id',
    type: 'number',
  })
  async findById(@Param('id') id: string): Promise<MediaItem> {
    return await firstValueFrom(this.animeService.byIdV2(+id));
  }
}
