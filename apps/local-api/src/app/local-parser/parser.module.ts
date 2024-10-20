import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ParserController } from './parser.controler';
import { MapsApiService } from './services/maps-api.service';
import { ParserLocalService } from './services/parser-local.service';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [ParserController],
  providers: [MapsApiService, ParserLocalService],
})
export class LocalParserModule {}
