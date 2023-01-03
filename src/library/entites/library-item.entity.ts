import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MediaItem } from '../interface';
import { LibraryItemType } from '../../models';

@Entity({
  name: 'library',
})
export class LibraryItemEntity implements MediaItem {

  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  processed: boolean;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  originalTitle: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  description: string | null;

  @ApiProperty()
  @Column()
  image: string;

  @ApiProperty()
  @Column('simple-array')
  genreIds: number[];

  @ApiProperty()
  @Column()
  episodes: number | null;

  @ApiProperty()
  @Column()
  popularity: number;

  @ApiProperty()
  @Column()
  year: number;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: LibraryItemType,
  })
  type: LibraryItemType;

  @ApiProperty()
  @Column()
  url: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  shikimoriId?: number | null;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  aniDbId?: number | null;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  imdbId?: number | null;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  smotretId?: number | null;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  kinopoiskId?: number | null;
}

export class MediaItemDTO implements MediaItem {
  id: number;
  processed: boolean;
  title: string;
  originalTitle: string;
  description: string | null;
  image: string;
  genreIds: number[];
  episodes: number;
  popularity: number;
  year: number;
  type: LibraryItemType;
  url: string;
  shikimoriId: number | null;
  aniDbId: number | null;
  imdbId: number | null;
  smotretId?: number | null;
  kinopoiskId?: number | null;

  constructor(entity: LibraryItemEntity) {
    Object.keys(entity).forEach(key => {
      if (key !== 'processed') {
        this[key] = entity[key];
      }
    });
  }
}
