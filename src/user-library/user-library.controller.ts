import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserLibraryService } from './user-library.service';
import { Library } from '../library/interface';
import { Cron } from '@nestjs/schedule';
import { BaseResponse } from '../base/base-response';

@ApiTags('user-library')
@Controller('user-library')
export class UserLibraryController {
  constructor(
    private userLibraryService: UserLibraryService,
  ) {
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('list')
  @ApiBody({
    schema: {
      properties: {
        tags: {
          type: undefined,
        },
        data: {
          type: undefined,
        },
        settings: {
          type: undefined,
        },
      },
    },
  })
  async postList(
    @Request() req,
    @Body() library: Library,
  ): Promise<BaseResponse> {
    return this.userLibraryService.postList(req.user.id, library).then(() => new BaseResponse());
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('list')
  async getList(
    @Request() req,
  ): Promise<Library> {
    return this.userLibraryService.loadList(req.user.id);
  }
}
