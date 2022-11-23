import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MapOldEntity } from './entites/mapOldEntity';
import { GenreEntity } from './entites/genre.entity';
import { ParserController } from './parser.controler';
import { ParserBeatSaverService } from './services/parser-beat-saver.service';
import { TagsService, MapsService } from "../maps";
import { AuthorsService } from './services/authors-service';
import { SettingsService } from "../settings/services/settings-service";
import { ErrorsService } from "../settings/services/errors-service";
import { ProxyService } from "./services/proxy.service";

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([MapOldEntity, GenreEntity]),
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
        ProxyService,
    ],
})
export class ParserModule {
}
