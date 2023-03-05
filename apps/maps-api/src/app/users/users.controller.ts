import { ApiBody, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Post } from "@nestjs/common";
import { UsersService } from "./services/users.service";
import { BaseResponse } from "../base/base-response";

@ApiTags('users')
@Controller('users')
export class UsersController {
   constructor(
      private userService: UsersService,
   ) {
   }

   @Post('songs')
   @ApiBody({
      type: 'string',
      isArray: true,
   })
   importSongs(
      @Body() list: string[],
   ): Promise<BaseResponse> {
      return this.userService.updateUserSongs(list).then(() => new BaseResponse());
   }

   @Post('artists')
   @ApiBody({
      type: 'string',
      isArray: true,
   })
   importArtists(
      @Body() list: string[],
   ): Promise<BaseResponse> {
      return this.userService.updateUserArtists(list).then(() => new BaseResponse());
   }

  @Post('login')
  @ApiBody({
    type:
  })
}
