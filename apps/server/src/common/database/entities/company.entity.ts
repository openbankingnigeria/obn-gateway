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
import { CompanyTypes } from '../constants';
import { CompanyKybData } from './company-kyb.entity';

export enum KybStatuses {
  APPROVED = 'approved',
  PENDING = 'pending',
  DENIED = 'denied',
}

export enum CompanyStatuses {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name?: string;

  @Column({ name: 'rc_number', nullable: true, unique: true })
  rcNumber: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  // @Column({ name: 'consumer_id', nullable: true })
  // consumerId?: string;

  @Column({
    default: CompanyStatuses.ACTIVE,
    type: 'enum',
    enum: CompanyStatuses,
  })
  status?: CompanyStatuses;

  @OneToOne(() => CompanyKybData)
  @JoinColumn({ name: 'kyb_data_id' })
  kybData?: CompanyKybData;

  @Column({ name: 'kyb_data_id', nullable: true })
  kybDataId?: string;

  @Column('enum', { enum: CompanyTypes })
  type: CompanyTypes;

  @Column({ nullable: true })
  subtype: string;

  @Column({ nullable: true })
  tier?: string;

  @OneToMany(() => User, (user) => user.company)
  users?: User[];

  @JoinColumn({ referencedColumnName: 'id', name: 'primary_user_id' })
  @OneToOne(() => User, {
    cascade: true,
    nullable: true,
  })
  primaryUser?: User;

  @Column({ nullable: true, name: 'kyb_status', default: 'pending' })
  kybStatus?: KybStatuses;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.company)
  auditLogs?: AuditLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
