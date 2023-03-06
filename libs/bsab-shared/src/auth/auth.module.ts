import { Module } from '@nestjs/common';

import { AuthService } from './services/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { HttpStrategy } from './strategy/http.strategy';
import { AppPassportModule } from "./const";

@Module({
   imports: [
      TypeOrmModule.forFeature([UserEntity]),
      AppPassportModule,
   ],
   controllers: [],
   providers: [
      AuthService,
      HttpStrategy,
   ],
   exports: [
      AppPassportModule,
   ]
})
export class AuthModule {
}
