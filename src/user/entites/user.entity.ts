import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../interface';

@Entity({
  name: 'users',
})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column()
  resetHash: string;
}

export class UserDto implements UserResponse {
  id: number;
  email: string;
  token: string;

  constructor(
    entity: UserEntity,
    token: string,
  ) {
    this.id = entity.id;
    this.email = entity.email;
    this.token = token;
  }
}
