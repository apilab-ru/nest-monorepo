import { Module } from '@nestjs/common';
//import { LocalParserModule } from "./local-parser/parser.module";
import { ProxyModule } from './proxy/proxy.module';
import { MapsLocalModule } from './maps/maps.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { environment } from '../environments/environment';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  imports: [
    //LocalParserModule,
    ProxyModule,
    MapsLocalModule,
    PlaylistsModule,
    ServeStaticModule.forRoot({
      rootPath: environment.levelsPath,
      serveRoot: '/map',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
