import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MapsController } from './maps.controler';
import { TagsService } from "./services/tags-service";
import { MapsService } from "./services/maps-service";
import { MapEntity } from "./entites/mapEntity";
import { TagEntity } from "./entites/tag.entity";
import { ErrorsService } from "../settings/services/errors-service";
import { AuthModule } from "../auth/auth.module";

@Module({
   imports: [
      TypeOrmModule.forFeature([MapEntity, TagEntity]),
      ScheduleModule.forRoot(),
      AuthModule,
   ],
   controllers: [
      MapsController,
   ],
   providers: [
      TagsService,
      MapsService,
      ErrorsService,
   ],
})
export class MapsModule {
}
