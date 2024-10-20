import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MapsService } from '@bsab/shared/maps/services/maps-service';
import { TagsService } from '@bsab/shared/maps/services/tags-service';
import { TagEntity } from '@bsab/shared/maps/entites/tag.entity';
import { MapsSearch } from '@bsab/shared/maps/interfaces/maps-search';
import { BASE_RESPONSE, BaseRequest } from '@bsab/api/request/interface';
import { MapDetail } from '@bsab/api/map/map-detail';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from '@utils/auth/optional-auth-guard';
import { User } from '@bsab/api/user/user';
import { PageResponse } from '@bsab/api/map/page';
import { OrderField } from '@bsab/shared/maps/interfaces/map';
import { OrderDirection } from '@bsab/api/request/request';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
  constructor(
    private mapsService: MapsService,
    private tagsService: TagsService,
  ) {}

  @Get('list')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'tagsPositive',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'tagsNegative',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'npsFrom',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'npsTo',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'orderField',
    type: 'string',
    enum: Object.keys(OrderField),
    required: false,
  })
  @ApiQuery({
    name: 'orderDirection',
    type: 'string',
    enum: OrderDirection,
    required: false,
  })
  @ApiBearerAuth()
  list(
    @Query() query: MapsSearch,
    @Request() { user }: { user: User },
  ): Promise<PageResponse<MapDetail>> {
    return this.mapsService.loadListDetails(query, user?.id);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  getById(@Param('id') id: string): Promise<MapDetail> {
    return this.mapsService.loadById(id);
  }

  @Get('tags')
  tags(): Promise<TagEntity[]> {
    return this.tagsService.loadTags();
  }

  @Post('showed')
  @UseGuards(AuthGuard())
  @ApiBody({
    schema: {
      properties: {
        id: { type: 'string' },
      },
    },
  })
  markShowed(
    @Body('id') id: string,
    @Request() { user }: { user: User },
  ): Promise<BaseRequest> {
    return this.mapsService.markAsShowed(id, user.id).then(() => BASE_RESPONSE);
  }

  @Post('not-work')
  markNotWork(@Body('id') id: string): Promise<BaseRequest> {
    return this.mapsService.markAsNotWorking(id).then(() => BASE_RESPONSE);
  }

  @Post('showed-list')
  @ApiBody({
    schema: {
      properties: {
        ids: { type: 'array' },
      },
    },
  })
  markShowedList(@Body('ids') ids: string[]): Promise<BaseRequest> {
    return this.mapsService.markAsShowedList(1, ids).then(() => BASE_RESPONSE);
  }
}
