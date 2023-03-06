import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ErrorsService } from "@utils/exceptions/errors-service";
import { ProxyService } from "./services/proxy.service";
import { ParserController } from "./proxy.controler";

@Module({
   imports: [
      HttpModule,
   ],
   controllers: [
      ParserController
   ],
   providers: [
      ErrorsService,
      ProxyService,
   ],
})
export class ProxyModule {
}
