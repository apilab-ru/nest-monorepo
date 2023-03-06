import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ParserBeatSaverService } from './services/parser-beat-saver.service';
import { SettingsService } from "@bsab/shared/settings/services/settings-service";

@ApiTags('parser')
@Controller('parser')
export class ParserController {
  constructor(
    private parserService: ParserBeatSaverService,
    private settingsService: SettingsService,
  ) {
  }

  @Get('parser-beat')
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
    const page = params?.page || 1;
    const reload = params?.reload || false;

    this.parserPage(page, reload);
    return 'success';
  }

  @Get('fix-format')
  fixFormat() {
    return this.parserService.fixFormat();
  }

  @Get('errors')
  fixErrors() {
    return this.parserService.fixErrors();
  }

  @Get('migrate')
  migrate() {
    return this.parserService.migrate();
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

      const lastItem = list?.length ? list[list.length - 1] : null;
      console.log('xxx process', page, time, lastItem?.createdAt);

      if (list.length) {
        this.parserPage(page + 1, reload);
      } else {
        console.log('xxx stop');
      }
    });
  }

}
