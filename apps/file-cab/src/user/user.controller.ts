import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './services/user.service';
import { AuthParams, UserResponse } from './interface';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Post('auth')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async auth(@Body() params: AuthParams): Promise<UserResponse> {
    return await this.userService.login(params);
  }

  @Post('registration')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async registration(@Body() params: AuthParams): Promise<UserResponse> {
    return await this.userService.registration(params).catch(error => {
      if (error.toString().includes('Duplicate')) {
        throw new HttpException('userExisted', HttpStatus.BAD_REQUEST);
      }

      throw new HttpException(error.toString(), HttpStatus.BAD_REQUEST);
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('me')
  async getMe(
    @Request() req,
  ): Promise<UserResponse> {
    return req.user;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('logout')
  async logout(
    @Request() req,
  ): Promise<void> {
    return this.userService.logout(req.user);
  }

  @Post('resetPassword')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
      },
    },
  })
  async resetPassword(@Body() { email }: { email: string }): Promise<void> {
    return this.userService.sendResetPassword(email);
  }

  @Get('reset/:hash')
  reset(@Param('hash') hash: string): Promise<string> {
    return this.userService.resetPassword(hash).then(
      () => 'Пароль успешно пересоздан, и отправлен на вашу почту.',
    );
  }
}
