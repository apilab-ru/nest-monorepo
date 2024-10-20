import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { BaseResponse } from '@utils/base/base-response';
import { User, UserAuthParams, UserRegParams } from '@bsab/api/user/user';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('songs')
  @UseGuards(AuthGuard())
  @ApiBody({
    type: 'string',
    isArray: true,
  })
  importSongs(
    @Body() list: string[],
    @Request() { user }: { user: User },
  ): Promise<BaseResponse> {
    return this.userService
      .updateUserSongs(list, user.id)
      .then(() => new BaseResponse());
  }

  @Post('artists')
  @UseGuards(AuthGuard())
  @ApiBody({
    type: 'string',
    isArray: true,
  })
  importArtists(
    @Body() list: string[],
    @Request() { user }: { user: User },
  ): Promise<BaseResponse> {
    return this.userService
      .updateUserArtists(list, user.id)
      .then(() => new BaseResponse());
  }

  @Post('login')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async login(@Body() params: UserAuthParams): Promise<User> {
    return await this.userService.login(params);
  }

  @Post('registration')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  async registration(@Body() params: UserRegParams): Promise<User> {
    return await this.userService.registration(params);
  }
}
