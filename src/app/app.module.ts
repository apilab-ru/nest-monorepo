import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_CONFIG } from './config/db-config';
import { ParserModule } from './parser/parser.module';
import { SettingsService } from "./settings/services/settings-service";
import { MapsModule } from "./maps/maps.module";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot(DB_CONFIG),
    ParserModule,
    MapsModule,
  ],
  controllers: [],
  providers: [
    SettingsService,
  ],
})
export class AppModule {
}
