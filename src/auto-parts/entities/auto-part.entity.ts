import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CarModelEntity } from './car-model.entity.js';
import { CompatibilityCodeEntity } from './compatibility-code.entity.js';
import { SpecificationEntity } from './specification.entity.js';

export enum PartCondition {
  New = 'NEW',
  Refurbished = 'REFURBISHED',
}

@Entity('auto_parts')
export class AutoPartEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number): number => value,
      from: (value: string): number => Number(value),
    },
  })
  price!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  oemCode!: string;

  @Column({ type: 'enum', enum: PartCondition })
  condition!: PartCondition;

  @ManyToOne(() => CarModelEntity, (model) => model.autoParts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'car_model_id' })
  carModel!: CarModelEntity;

  @ManyToMany(() => SpecificationEntity, (specification) => specification.autoParts, {
    cascade: true,
  })
  @JoinTable({
    name: 'auto_part_specifications',
    joinColumn: { name: 'auto_part_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'specification_id',
      referencedColumnName: 'id',
    },
  })
  specifications!: SpecificationEntity[];

  @OneToOne(() => CompatibilityCodeEntity, (code) => code.autoPart, {
    cascade: true,
    nullable: true,
  })
  compatibilityCode!: CompatibilityCodeEntity | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt!: Date | null;
}
