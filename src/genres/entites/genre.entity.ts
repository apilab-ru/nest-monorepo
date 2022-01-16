import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GenreKind } from '../const';
import { Genre } from '../../models/genre';

@Entity({
  name: 'genres',
})
export class GenreEntity implements Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({
    type: 'set',
    enum: GenreKind,
  })
  kind: GenreKind[];

  @ApiProperty()
  @Column()
  imdbId?: number | null;

  @ApiProperty()
  @Column()
  smotretId?: number | null;
}
