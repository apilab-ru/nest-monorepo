import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { UtilsService } from './utils.service';

@ApiTags('utils')
@Controller('utils')
export class UtilsController {
  constructor(private utilsService: UtilsService) {}

  @Get('genre-errors')
  async genreErrors(): Promise<any> {
    return this.utilsService.loadGenresErrors();
  }
}
