import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { MapsLocalService } from "./services/maps-local-service";
import { MapsIdsResponse, MapsResponse, PageRequest } from "@bsab/api/map/response";
import { MapCinema } from "@bsab/api/map/map";
import { FileInterceptor } from "@nestjs/platform-express";
import { RequestFile } from "./models/request-file";
import { Playlist } from "@bsab/api/local/playlist";

@ApiTags('maps')
@Controller('maps')
export class MapsLocalController {
   constructor(
      private mapsService: MapsLocalService,
   ) {}

   @ApiQuery({
      name: 'offset',
      type: 'number',
      required: false,
   })
   @ApiQuery({
      name: 'limit',
      type: 'number',
      required: false,
   })
   @Get('')
   async getListMaps(
      @Query() { offset, limit }: PageRequest,
   ): Promise<MapsResponse> {
      const date = new Date();
      const response = await this.mapsService.loadMaps(offset, limit);

      return { ...response, time: new Date().getTime() - date.getTime() }
   }

   @Post(':id/upload-video')
   @UseInterceptors(FileInterceptor('video'))
   async uploadCinemaVideo(
      @UploadedFile() file: RequestFile,
      @Body() params: { details?: string },
      @Param('id') id: string
   ): Promise<MapCinema> {
      const details = params?.details ? JSON.parse(params.details) : undefined;

      return this.mapsService.uploadCinemaVideo(id, file, details);
   }

   @Patch(':id/cinema')
   async updateMapCinema(
      @Param('id') id: string,
      @Body() cinema: MapCinema
   ): Promise<MapCinema> {
      this.mapsService.saveMapCinema(id, cinema);

      return cinema;
   }

   @Get('ids')
   async getMapsIds(): Promise<MapsIdsResponse> {
      const response = await this.mapsService.loadMaps();

      return this.mapsService.getBeatSaverIds(response.maps);
   }

   @Get('install')
   async installPreparedMap(): Promise<{ count: number }> {
      const count = await this.mapsService.installPreparedMaps(true);

      return { count }
   }
}
