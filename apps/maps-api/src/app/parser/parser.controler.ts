import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ParserBeatSaverService } from './services/parser-beat-saver.service';
import { SettingsService } from "@bsab/shared/settings/services/settings-service";
import { Cron } from "@nestjs/schedule";
import { environment } from "../../environments/environment";
import { SongsService } from "./services/songs-service";
import { map, tap } from "rxjs";

@ApiTags('parser')
@Controller('parser')
export class ParserController {
   private parsingStopped = false;
   private lastMetaParsed = {}

   constructor(
      private parserService: ParserBeatSaverService,
      private songsService: SongsService,
      private settingsService: SettingsService,
   ) {
   }

   @Cron('0 23 22 * * *')
   parserBeatReload() {
     return this.parserBeat({ page: 0, reload: 'true' })
   }

  @Cron('0 */15 * * * *')
  parserBeatNew() {
    return this.parserBeat({ page: 0, reload: 'false' })
  }

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
      @Query() params: { page?: number, reload?: string }
   ): string {
      this.parsingStopped = false;
      const page = params?.page ? +params.page : 1;
      const reload = params?.reload === 'true' || false;

      this.lastMetaParsed = {
         date: new Date().toISOString()
      }

      this.parserPage(page, reload);
      return 'success';
   }

   @Cron('0 */1 * * * *')
   @Get('songs')
   parserSongs() {
      const timeStart = new Date().getTime();
      console.log('xxx parse songs');

      return this.songsService.parseSongsFromMaps().pipe(
         map(() => ({
            durationSeconds: (new Date().getTime() - timeStart) / 1000
         })),
         tap(({ durationSeconds }) => console.log('xxx parse songs complete: ', durationSeconds)),
      ).toPromise();
   }

  @Cron('0 */30 * * * *')
   @Get('songs/load')
   loadSongs() {
      const timeStart = new Date().getTime();
      console.log('xxx load songs');

      return this.songsService.loadSongs().pipe(
         map(res => ({
            ...res,
            durationSeconds: (new Date().getTime() - timeStart) / 1000
         })),
         tap(({ durationSeconds }) => console.log('xxx parse songs complete: ', durationSeconds)),
      ).toPromise()
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

         if (!this.parsingStopped && list.length) {
            setTimeout(() => this.parserPage(page + 1, reload), environment.timeout)
         } else {
            this.lastMetaParsed = {
               ...this.lastMetaParsed,
               stopDate: new Date().toISOString()
            }
         }
      });
   }

}
