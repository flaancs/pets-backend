import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Exclude } from "class-transformer";
import { Pet } from "@/pets/entities/pet.entity";
import * as bcrypt from "bcrypt";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 300 })
  name: string;

  @Column({ length: 300, unique: true })
  email: string;

  @Exclude()
  @Column({ length: 500 })
  password: string;

  @Column({ length: 15 })
  phoneNumber: string;

  @OneToMany(() => Pet, (pet) => pet.user)
  pets: Pet[];

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
