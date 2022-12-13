import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { ParserBeatSaverService } from './services/parser-beat-saver.service';
import { SettingsService } from "../settings/services/settings-service";
import { ProxyService } from "./services/proxy.service";
import { Response } from 'express';
import { Readable } from 'stream';

@ApiTags('parser')
@Controller('parser')
export class ParserController {
    constructor(
        private parserService: ParserBeatSaverService,
        private settingsService: SettingsService,
        private proxyService: ProxyService,
    ) {
    }

    @Get('parser-beat')
    parserBeat(): string {
        const page = 1;
        this.parserPage(page);
        return 'success';
    }

    @ApiQuery({
        name: 'file',
        type: 'string',
        required: true,
    })
    @Get('proxy-file')
    async proxyFile(
        @Query() query: { file: string },
        @Res() res: Response,
    ) {
        const buffer = await this.proxyService.proxyFile(query.file);
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

    @Get('fix-format')
    fixFormat() {
        return this.parserService.fixFormat();
    }

    private parserPage(page: number) {
        const start = new Date().getTime();
        console.log('xxx start', page, new Date().toTimeString());
        this.parserService.loadPage(page).subscribe(list => {
            const time = Math.ceil((new Date().getTime() - start) / 1000);
            this.settingsService.updateSettings('parserProcess', {
                time,
                page,
            });

            const lastItem = list?.length ? list[list.length - 1] : null;
            console.log('xxx process', page, time, lastItem?.createdAt);

            if (list.length) {
                this.parserPage(page + 1);
            } else {
                console.log('xxx stop');
            }
        });
    }

}
