import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { Readable } from "stream";
import { ProxyService } from "./services/proxy.service";

@ApiTags('proxy')
@Controller('proxy')
export class ParserController {
   constructor(
      private proxyService: ProxyService,
   ) {}

   @ApiQuery({
      name: 'file',
      type: 'string',
      required: true,
   })
   @Get('file')
   async proxyFile(
      @Query() query: { file: string },
      @Res() res: Response,
   ) {
      const buffer = await this.proxyService.proxyFile(query.file)
         .catch((error) => {
            console.log('xxx error', error);
         })

      if (!buffer) {
         // this.errorService.addError({ error: 'Proxy file' }, query.file);
         throw new Error('notFound');
      }

      const stream = new Readable();
      const type = this.proxyService.getFileType(query.file);

      stream.push(buffer);
      stream.push(null);

      res.set({
         'Content-Type': type,
         'Content-Length': buffer.length,
      });

      stream.pipe(res);
   }
}
