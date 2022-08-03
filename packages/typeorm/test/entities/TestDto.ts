import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TestDto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}
