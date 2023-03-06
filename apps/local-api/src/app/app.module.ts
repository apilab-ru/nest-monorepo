import { Module } from '@nestjs/common';
import { ParserModule } from "./parser/parser.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DB_CONFIG } from "./config/db-config";
import { ProxyModule } from "./proxy/proxy.module";

@Module({
   imports: [
      ParserModule,
      ProxyModule,
      TypeOrmModule.forRoot(DB_CONFIG),
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
