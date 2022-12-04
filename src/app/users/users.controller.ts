import { ApiTags } from "@nestjs/swagger";
import { Controller } from "@nestjs/common";
import { UsersService } from "./services/users.service";

@ApiTags('users')
@Controller('users')
export class UsersController {
   constructor(
      private userService: UsersService,
   ) {
   }
}
