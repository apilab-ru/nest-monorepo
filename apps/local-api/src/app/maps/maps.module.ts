import { Module } from "@nestjs/common";
import { ErrorsService } from "@utils/exceptions/errors-service";
import { MapsLocalService } from "./services/maps-local-service";
import { MapsLocalController } from "./maps.controler";

@Module({
   imports: [],
   controllers: [
      MapsLocalController
   ],
   providers: [
      MapsLocalService,
      ErrorsService,
   ],
})
export class MapsLocalModule {
}
