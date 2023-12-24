import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AuditLog } from './auditlog.entity';
import { Settings } from './settings.entity';
import { CompanyTypes } from '../constants';
import { ConsumerAcl } from './consumeracl.entity';

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name?: string;

  @Column({ name: 'rc_number', nullable: true, unique: true })
  rcNumber: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'consumer_id', nullable: true })
  consumerId?: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column('longblob', { name: 'kyb_data', nullable: true })
  kybData?: string;

  @Column('enum', { enum: CompanyTypes })
  type: CompanyTypes;

  @Column()
  subtype: string;

  @Column({ nullable: true })
  tier?: string;

  @OneToMany(() => ConsumerAcl, (consumerAcl) => consumerAcl.company)
  acls: ConsumerAcl[];

  @OneToMany(() => User, (user) => user.company)
  users?: User[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.company)
  auditLogs?: AuditLog[];

  @OneToMany(() => Settings, (settings) => settings.company)
  settings?: Settings[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
