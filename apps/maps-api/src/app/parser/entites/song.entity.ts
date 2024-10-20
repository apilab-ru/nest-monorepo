import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'songs',
})
export class SongEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  discId: number | null;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  subName: string;

  @ApiProperty()
  @Column()
  band: string | null;

  @ApiProperty()
  @Column()
  duration: number;

  @ApiProperty()
  @Column({
    type: 'json',
  })
  tags: number[];
}
