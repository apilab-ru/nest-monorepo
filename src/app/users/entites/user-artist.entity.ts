import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
   name: 'user-artists',
})
export class UserArtistEntity {

   @PrimaryGeneratedColumn()
   id: number;

   @ApiProperty()
   @Column()
   user_id: string;

   @ApiProperty()
   @Column()
   artist_id: number;
}
