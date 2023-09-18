import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ParserController } from './parser.controler';
import { ParserBeatSaverService } from './services/parser-beat-saver.service';
import { AuthorsService } from './services/authors-service';
import { ErrorsService } from "@utils/exceptions/errors-service";
import { SettingsService } from "@bsab/shared/settings/services/settings-service";
import { MapsService, TagsService } from "@bsab/shared/maps";

@Module({
   imports: [
      HttpModule,
      TypeOrmModule.forFeature([]),
      ScheduleModule.forRoot(),
   ],
   controllers: [
      ParserController,
   ],
   providers: [
      ParserBeatSaverService,
      TagsService,
      AuthorsService,
      MapsService,
      SettingsService,
      ErrorsService,
   ],
})
export class ParserModule {
}
