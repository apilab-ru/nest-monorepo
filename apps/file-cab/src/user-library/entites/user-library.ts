import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { ApiProperty } from '@nestjs/swagger';
import { LibraryFlatData, Tag } from '../../library/interface';

@Entity({
  name: 'user-library',
})
export class UserLibraryEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @ApiProperty()
  @Column({
    type: 'json',
  })
  data: Record<string, LibraryFlatData[]>;

  @ApiProperty()
  @Column({
    type: 'json',
  })
  tags: Tag[];
}
