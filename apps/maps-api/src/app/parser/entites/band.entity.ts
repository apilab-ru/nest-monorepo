import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
   name: 'songs_bands',
})
export class BandEntity {

   @PrimaryGeneratedColumn()
   id: number;

   @ApiProperty()
   @Column()
   name: string;
}
