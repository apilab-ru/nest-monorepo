import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MapsController } from './maps.controler';
import { TagsService } from '@bsab/shared/maps/services/tags-service';
import { MapsService } from '@bsab/shared/maps/services/maps-service';
import { MapEntity } from '@bsab/shared/maps/entites/mapEntity';
import { TagEntity } from '@bsab/shared/maps/entites/tag.entity';
import { ErrorsService } from '@utils/exceptions/errors-service';
import { AuthModule } from '@bsab/shared/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MapEntity, TagEntity]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [MapsController],
  providers: [TagsService, MapsService, ErrorsService],
})
export class MapsModule {}
