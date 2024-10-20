import { Module } from '@nestjs/common';
import { PlaylistsService } from './services/playlists-service';
import { PlaylistsController } from './playlists.controller';
import { MapsLocalService } from '../maps/services/maps-local-service';

@Module({
  imports: [],
  controllers: [PlaylistsController],
  providers: [PlaylistsService, MapsLocalService],
})
export class PlaylistsModule {}
