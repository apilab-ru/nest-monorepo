import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { PlaylistsService } from "./services/playlists-service";
import { Playlist } from "@bsab/api/local/playlist";
import { MapsLocalService } from "../maps/services/maps-local-service";

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistsController {
   constructor(
      private playlistsService: PlaylistsService,
      private mapsService: MapsLocalService
   ) {
   }

   @Get('')
   async getPlaylists() {
      const list = await this.playlistsService.getList();

      return { list };
   }

   @Post('')
   async createPlaylist(@Body() playlist: Playlist): Promise<Playlist> {
     return this.playlistsService.createPlaylist(playlist);
   }

   @Post(':playlistId/add-song/:songId')
   async addSong(@Param('playlistId') playlistId: string, @Param('songId') songId: string): Promise<any> {
     const song = await this.mapsService.loadMapById(songId);
     let playlist = await this.playlistsService.getById(playlistId);

     if (!song || !playlist) {
       throw new Error('notFound');
     }

     playlist = await this.playlistsService.addSongToPlaylist(playlist, song);

     return this.playlistsService.updatePlaylist(playlistId, playlist);
   }

   @Patch(':id')
   async updatePlaylist(@Body() playlist: Playlist, @Param('id') id: string): Promise<void> {
      return this.playlistsService.updatePlaylist(id, playlist);
   }

   @Delete(':id')
   async removePlaylist(@Param('id') id: string): Promise<void> {
      return this.playlistsService.removePlaylist(id);
   }
}
