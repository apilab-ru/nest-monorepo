import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Query, Res } from "@nestjs/common";
import { MapsLocalService } from "./services/maps-local-service";
import { LocalMap } from "@bsab/api/map/map";
import { MapsIdsResponse } from "./response";

@ApiTags('maps')
@Controller('maps')
export class MapsLocalController {
   constructor(
      private mapsService: MapsLocalService,
   ) {}

   @Get('')
   async getListMaps(): Promise<{ maps: LocalMap[], time: number }> {
      const date = new Date();
      const maps = await this.mapsService.loadMaps();

      return { maps, time: new Date().getTime() - date.getTime() }
   }

   @Get('ids')
   async getMapsIds(): Promise<MapsIdsResponse> {
      const maps = await this.mapsService.loadMaps();

      return this.mapsService.getBeatSaverIds(maps);
   }

   @Get('install')
   async installPreparedMap(): Promise<{ count: number }> {
      const count = await this.mapsService.installPreparedMaps(true);

      return { count }
   }
}
