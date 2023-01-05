import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
   name: 'user_songs',
})
export class UserSongsEntity {

   @PrimaryGeneratedColumn()
   id: number;

   @ApiProperty()
   @Column()
   user_id: number;

   @ApiProperty()
   @Column()
   song: string;
}
