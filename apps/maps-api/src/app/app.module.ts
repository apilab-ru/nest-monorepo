import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_CONFIG } from './config/db-config';
import { SettingsService } from '@bsab/shared/settings/services/settings-service';
import { MapsModule } from './maps/maps.module';
import { AuthModule } from '@bsab/shared/auth/auth.module';
import { UsersModule } from './users/users.module';
import { ParserModule } from './parser/parser.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot(DB_CONFIG),
    MapsModule,
    AuthModule,
    UsersModule,
    ParserModule,
  ],
  controllers: [],
  providers: [SettingsService],
})
export class AppModule {}
