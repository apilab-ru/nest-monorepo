import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
    name: 'errors',
})
export class ErrorEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    error: string;

    @ApiProperty()
    @Column()
    data: string;
}
