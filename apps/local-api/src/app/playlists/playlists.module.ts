import { Module } from "@nestjs/common";
import { ErrorsService } from "@utils/exceptions/errors-service";
import { PlaylistsService } from "./services/playlists-service";
import { PlaylistsController } from "./playlists.controller";

@Module({
   imports: [],
   controllers: [
      PlaylistsController
   ],
   providers: [
      PlaylistsService,
      ErrorsService,
   ],
})
export class PlaylistsModule {
}
