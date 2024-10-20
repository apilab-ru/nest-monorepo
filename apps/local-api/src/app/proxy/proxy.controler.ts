import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { ProxyService } from './services/proxy.service';
import { environment } from '../../environments/environment';

import fs from 'fs';
import JSZip from 'jszip';
import { Req } from '@nestjs/common/decorators/http/route-params.decorator';

@ApiTags('proxy')
@Controller('proxy')
export class ParserController {
  constructor(private proxyService: ProxyService) {}

  @ApiQuery({
    name: 'file',
    type: 'string',
    required: true,
  })
  @Get('file')
  async proxyFile(@Query() query: { file: string }, @Res() res: Response) {
    const buffer = await this.proxyService
      .proxyFile(query.file)
      .catch((error) => {
        console.log('xxx error', error);
      });

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

  @ApiQuery({
    name: 'file',
    type: 'string',
    required: true,
  })
  @Get('source')
  async proxySource(@Req() req: { originalUrl: string }, @Res() res: Response) {
    const [_, file] = req.originalUrl.split('?file=');
    const dir = environment.levelsPath + decodeURIComponent(file);

    try {
      const listFiles = await fs.promises.readdir(dir);

      const allFiles = await Promise.all(
        listFiles.map((file) =>
          fs.promises.readFile(dir + '/' + file).then((data) => ({
            file,
            data,
          })),
        ),
      );

      const zip = new JSZip();
      allFiles.forEach(({ file, data }) => {
        zip.file(file, data);
      });

      const stream = zip.generateNodeStream({ type: 'nodebuffer' });

      res.set({
        'Content-Type': 'application/zip',
        // 'Content-Length': buffer.length,
      });

      stream.pipe(res);
    } catch (e) {
      res.status(404);
      console.log('dir', dir);
      console.error(e);
      res.send('File not found');
    }
  }
}
