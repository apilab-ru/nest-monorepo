import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
   name: 'user-songs',
})
export class UserSongsEntity {

   @PrimaryGeneratedColumn()
   id: number;

   @ApiProperty()
   @Column()
   user_id: string;

   @ApiProperty()
   @Column()
   song_id: number;
}
