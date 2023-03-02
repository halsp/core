import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import "reflect-metadata";

@Entity()
export class TestEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}
