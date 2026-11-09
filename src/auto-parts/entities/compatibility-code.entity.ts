import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { AutoPartEntity } from './auto-part.entity.js';

/**
 * OEM-код сумісності та розширені дані про взаємозамінність.
 * Зв'язок 1:1, володіюча сторона - ця сутність (містить auto_part_id).
 */
@Entity('compatibility_codes')
export class CompatibilityCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  manufacturer!: string;

  @Column({ type: 'boolean', name: 'is_interchangeable', default: false })
  isInterchangeable!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @OneToOne(() => AutoPartEntity, (part) => part.compatibilityCode, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'auto_part_id' })
  autoPart!: Relation<AutoPartEntity>;
}
