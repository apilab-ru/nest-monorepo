import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { MapsService } from "./services/maps-service";
import { TagsService } from "./services/tags-service";
import { TagEntity } from "./entites/tag.entity";
import { MapsSearch } from "./interfaces/maps-search";
import { MapEntity } from "./entites/mapEntity";

@ApiTags('maps')
@Controller('maps')
export class MapsController {
    constructor(
        private mapsService: MapsService,
        private tagsService: TagsService,
    ) {
    }

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
    @Get('list')
    list(@Query() query: MapsSearch): Promise<MapEntity[]> {
        return this.mapsService.loadList(query);
    }

    @Get('tags')
    tags(): Promise<TagEntity[]> {
        return this.tagsService.loadTags();
    }
}
