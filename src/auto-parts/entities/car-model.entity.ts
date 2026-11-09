import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AutoPartEntity } from './auto-part.entity.js';

@Entity('car_models')
@Index('uq_car_models_brand_name_year', ['brand', 'name', 'yearFrom'], {
  unique: true,
})
export class CarModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 80 })
  brand!: string;

  @Column({ type: 'smallint', name: 'year_from' })
  yearFrom!: number;

  @Column({ type: 'smallint', name: 'year_to', nullable: true })
  yearTo!: number | null;

  @OneToMany(() => AutoPartEntity, (part) => part.carModel)
  autoParts!: AutoPartEntity[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}
