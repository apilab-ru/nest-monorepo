import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
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
      ProxyService,
   ],
})
export class ProxyModule {
}
