import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ParserLocalService } from './services/parser-local.service';

@ApiTags('parser')
@Controller('parser')
export class ParserController {
  private syncProcess = {};

  constructor(private parserService: ParserLocalService) {}

  @Get('sync')
  parserBeat(): any {
    return this.parserService.loadMaps().toPromise();

    //return 'success';
  }

  /*private parserPage(page: number, reload: boolean) {
      const start = new Date().getTime();
      console.log('xxx start', page, new Date().toTimeString());

      this.parserService.loadPage(page, reload).subscribe(list => {
         const time = Math.ceil((new Date().getTime() - start) / 1000);
         this.settingsService.updateSettings('parserProcess', {
            time,
            page,
         });

         const lastItem = list?.length ? list[list.length - 1] : null;
         console.log('xxx process', page, time, lastItem?.createdAt);

         if (list.length) {
            this.parserPage(page + 1, reload);
         } else {
            console.log('xxx stop');
         }
      });
   }*/
}
