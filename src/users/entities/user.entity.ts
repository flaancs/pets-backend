import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Exclude } from "class-transformer";
import * as bcrypt from "bcrypt";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 300 })
  name: string;

  @Column({ type: "varchar", length: 300, unique: true })
  email: string;

  @Exclude()
  @Column({ type: "varchar", length: 500 })
  password: string;

  @Column({ type: "varchar", length: 15 })
  phoneNumber: string;

  @Column({ type: "boolean", default: false })
  isAdmin: boolean;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
