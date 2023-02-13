import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_CONFIG } from './config/db-config';
import { ParserModule } from './parser/parser.module';
import { SettingsService } from "./settings/services/settings-service";
import { MapsModule } from "./maps/maps.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

@Module({
   imports: [
      HttpModule,
      TypeOrmModule.forRoot(DB_CONFIG),
      ParserModule,
      MapsModule,
      AuthModule,
      UsersModule,
   ],
   controllers: [],
   providers: [
      SettingsService,
   ],
})
export class AppModule {
}
