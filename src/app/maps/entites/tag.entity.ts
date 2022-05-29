import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
    name: 'tags',
})
export class TagEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    name: string;
}
