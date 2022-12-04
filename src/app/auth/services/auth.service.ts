import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../users/entites/user.entity';

@Injectable()
export class AuthService {

   constructor(
      @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>
   ) {
   }

   validateUser(token: string): Promise<UserEntity> {
      return this.usersRepository.findOne({
         where: {
            token
         }
      });
   }

   byId(id: number): Promise<UserEntity> {
      return this.usersRepository.findOne({
         where: {
            id
         }
      });
   }

}
