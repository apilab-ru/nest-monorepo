import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
   name: 'users',
})
export class UserEntity {

   @PrimaryGeneratedColumn()
   id: number;

   @ApiProperty()
   @Column()
   name: string;

   @Column()
   token: string;
}
