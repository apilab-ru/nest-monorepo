import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { PlaylistsService } from "./services/playlists-service";
import { Playlist } from "@bsab/api/local/playlist";

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistsController {
   constructor(
      private playlistsService: PlaylistsService,
   ) {
   }

   @Get('')
   async getPlaylists() {
      const list = await this.playlistsService.getList();

      return { list };
   }

   @Post(':id')
   async updatePlaylist(@Body() playlist: Playlist, @Param('id') id: string): Promise<void> {
      return this.playlistsService.updatePlaylist(id, playlist);
   }

   @Delete(':id')
   async removePlaylist(@Param('id') id: string): Promise<void> {
      return this.playlistsService.removePlaylist(id);
   }
}
