import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AuditLog } from './auditlog.entity';
import { Settings } from './settings.entity';
import { CompanyTypes } from '../constants';
import { ConsumerAcl } from './consumeracl.entity';

export enum CompanyStatuses {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

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

  @Column({
    default: CompanyStatuses.PENDING,
    type: 'enum',
    enum: CompanyStatuses,
  })
  status?: CompanyStatuses;

  @Column('longblob', { name: 'kyb_data', nullable: true })
  kybData?: string;

  @Column('enum', { enum: CompanyTypes })
  type: CompanyTypes;

  @Column({ nullable: true })
  subtype: string;

  @Column({ nullable: true })
  tier?: string;

  @OneToMany(() => ConsumerAcl, (consumerAcl) => consumerAcl.company)
  acls: ConsumerAcl[];

  @OneToMany(() => User, (user) => user.company)
  users?: User[];

  @JoinColumn({ referencedColumnName: 'id', name: 'primary_user_id' })
  @OneToOne(() => User, {
    cascade: true,
    nullable: true,
  })
  primaryUser?: User;

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
