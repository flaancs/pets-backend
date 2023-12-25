import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "@/users/entities/user.entity"; // Adjust the import path as needed

@Entity()
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 300 })
  name: string;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 300 })
  breed: string;

  @Column()
  age: number;

  @ManyToOne(() => User, (user) => user.pets)
  user: User;

  @Column()
  isSterilized: boolean;
}
