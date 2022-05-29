import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
    name: 'genre',
})
export class GenreEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    hash: string;

    @ApiProperty()
    @Column()
    name: string;
}
