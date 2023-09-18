import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ParserBeatSaverService } from './services/parser-beat-saver.service';
import { SettingsService } from "@bsab/shared/settings/services/settings-service";
import { Cron } from "@nestjs/schedule";
import { environment } from "../../environments/environment";

@ApiTags('parser')
@Controller('parser')
export class ParserController {
   private parsingStopped = false;
   private lastMetaParsed = {}

   constructor(
      private parserService: ParserBeatSaverService,
      private settingsService: SettingsService,
   ) {
   }

   @Cron('0 23 22 * * *')
   @Get('beat')
   @ApiQuery({
      name: 'page',
      type: 'number',
      required: false
   })
   @ApiQuery({
      name: 'reload',
      type: 'boolean',
      required: false
   })
   parserBeat(
      @Query() params: { page?: number, reload?: boolean }
   ): string {
      this.parsingStopped = false;
      const page = params?.page ? +params.page : 1;
      const reload = params?.reload || false;

      this.lastMetaParsed = {
         date: new Date().toISOString()
      }

      this.parserPage(page, reload);
      return 'success';
   }

   @Get('info')
   parserInfo() {
      return this.lastMetaParsed;
   }

   @Get('stop')
   parserStop() {
      this.parsingStopped = true;
      return this.lastMetaParsed;
   }

   private parserPage(page: number, reload: boolean) {
      const start = new Date().getTime();
      console.log('xxx start', page, new Date().toTimeString());

      this.parserService.loadPage(page, reload).subscribe(list => {
         const time = Math.ceil((new Date().getTime() - start) / 1000);
         this.settingsService.updateSettings('parserProcess', {
            time,
            page,
         });

         this.lastMetaParsed = {
            ...this.lastMetaParsed,
            time,
            page
         }

         const lastItem = list?.length ? list[list.length - 1] : null;
         console.log('xxx process', page, time, lastItem?.createdAt);

         if (!this.parsingStopped && list.length) {
            setTimeout(() => this.parserPage(page + 1, reload), environment.timeout)
         } else {
            console.log('xxx stop');
         }
      });
   }

}
