import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ParserController } from './parser.controler';
import { ParserBeatSaverService } from './services/parser-beat-saver.service';
import { AuthorsService } from './services/authors-service';
import { ErrorsService } from '@utils/exceptions/errors-service';
import { SettingsService } from '@bsab/shared/settings/services/settings-service';
import { MapsService, TagsService } from '@bsab/shared/maps';
import { SongsService } from './services/songs-service';
import { SongsMetaApiService } from './services/songs-meta-api.service';
import { BeatLeaderService } from './services/beat-leader.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([]), ScheduleModule.forRoot()],
  controllers: [ParserController],
  providers: [
    ParserBeatSaverService,
    TagsService,
    AuthorsService,
    MapsService,
    SettingsService,
    ErrorsService,
    SongsService,
    SongsMetaApiService,
    BeatLeaderService,
  ],
})
export class ParserModule {}
