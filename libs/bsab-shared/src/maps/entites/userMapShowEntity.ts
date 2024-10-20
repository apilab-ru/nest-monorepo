import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'user_map_show',
})
export class UserMapShowEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ApiProperty()
  @Column()
  mapId: string;

  @ApiProperty()
  @Column()
  userId: number;
}
