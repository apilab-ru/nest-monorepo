import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
    name: 'settings',
})
export class SettingsEntity {

    @PrimaryGeneratedColumn()
    id: string;

    @ApiProperty()
    @Column({
        type: 'json',
    })
    data: any;
}
