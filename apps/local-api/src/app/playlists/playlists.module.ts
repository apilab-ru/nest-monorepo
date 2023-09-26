import { Module } from "@nestjs/common";
import { PlaylistsService } from "./services/playlists-service";
import { PlaylistsController } from "./playlists.controller";

@Module({
   imports: [],
   controllers: [
      PlaylistsController
   ],
   providers: [
      PlaylistsService,
   ],
})
export class PlaylistsModule {
}
