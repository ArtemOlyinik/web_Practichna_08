import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AutoPartEntity } from './auto-part.entity.js';

@Entity('specifications')
export class SpecificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToMany(() => AutoPartEntity, (part) => part.specifications)
  autoParts!: AutoPartEntity[];
}
