import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { ApiProperty } from '@nestjs/swagger';
import { Difficult } from '../const';

@Entity({
    name: 'maps_0',
})
export class MapOldEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    hash: string;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column()
    author: string;

    @ApiProperty()
    @Column({
        type: 'date',
    })
    date: Date;

    @ApiProperty()
    @Column({
        type: 'set',
        enum: Difficult,
    })
    difficulties: Difficult[];

    @ApiProperty()
    @Column({
        type: 'json',
    })
    genres: number[];

    @ApiProperty()
    @Column()
    image: string;

    @ApiProperty()
    @Column()
    description: string;

    @ApiProperty()
    @Column()
    ratingUp: number;

    @ApiProperty()
    @Column()
    ratingDown: number;
}
