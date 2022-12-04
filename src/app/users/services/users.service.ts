import { Injectable } from "@nestjs/common";
import { Connection, Repository } from "typeorm";
import { UserEntity } from "../entites/user.entity";

@Injectable()
export class UsersService {
   private repository: Repository<UserEntity>;

   constructor(
      connection: Connection,
   ) {
      this.repository = connection.getRepository(UserEntity);
   }
}
