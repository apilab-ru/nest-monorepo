import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
    name: 'authors',
})
export class AuthorEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column()
    hash: string;

    @ApiProperty()
    @Column()
    avatar: string;

    @ApiProperty()
    @Column()
    curator: boolean;
}
