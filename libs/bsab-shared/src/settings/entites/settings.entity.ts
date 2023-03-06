import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
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
