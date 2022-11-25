import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MapsService } from './services/maps-service';
import { TagsService } from './services/tags-service';
import { TagEntity } from './entites/tag.entity';
import { MapsSearch } from './interfaces/maps-search';
import { MapEntity } from './entites/mapEntity';
import { BASE_RESPONSE, BaseRequest } from '@bsab/api/request/interface';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
  constructor(
    private mapsService: MapsService,
    private tagsService: TagsService
  ) {
  }

  @Get('list')
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false
  })
  @ApiQuery({
    name: 'tagsPositive',
    type: 'string',
    required: false
  })
  @ApiQuery({
    name: 'tagsNegative',
    type: 'string',
    required: false
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false
  })
  @ApiQuery({
    name: 'npsFrom',
    type: 'string',
    required: false
  })
  @ApiQuery({
    name: 'npsTo',
    type: 'string',
    required: false
  })
  list(@Query() query: MapsSearch): Promise<MapEntity[]> {
    return this.mapsService.loadList(query);
  }

  @Get('tags')
  tags(): Promise<TagEntity[]> {
    return this.tagsService.loadTags();
  }

  @Post('showed')
  @ApiBody({
    schema: {
      properties: {
        id: { type: 'string' }
      }
    }
  })
  markShowed(@Body('id') id: string): Promise<BaseRequest> {
    return this.mapsService.markAsShowed(id).then(() => BASE_RESPONSE);
  }

  @Post('showed-list')
  @ApiBody({
    schema: {
      properties: {
        ids: { type: 'array' }
      }
    }
  })
  markShowedList(@Body('ids') ids: string[]): Promise<BaseRequest> {
    console.log('xxx ids', ids);
    return this.mapsService.markAsShowedList(ids).then(() => BASE_RESPONSE);
  }
}
