import { Module } from '@nestjs/common';
import { ParserModule } from "./parser/parser.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DB_CONFIG } from "./config/db-config";
import { ProxyModule } from "./proxy/proxy.module";
import { MapsLocalModule } from "./maps/maps.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { environment } from "../environments/environment";
import { PlaylistsModule } from "./playlists/playlists.module";

@Module({
   imports: [
      ParserModule,
      ProxyModule,
      MapsLocalModule,
      PlaylistsModule,
      TypeOrmModule.forRoot(DB_CONFIG),
      ServeStaticModule.forRoot({
         rootPath: environment.levelsPath,
         serveRoot: '/map'
      }),
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
