import { Module } from "@nestjs/common";
import { MapsLocalService } from "./services/maps-local-service";
import { MapsLocalController } from "./maps.controler";

@Module({
   imports: [],
   controllers: [
      MapsLocalController
   ],
   providers: [
      MapsLocalService,
   ],
})
export class MapsLocalModule {
}
