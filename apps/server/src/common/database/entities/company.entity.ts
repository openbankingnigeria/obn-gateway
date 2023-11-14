import { CompanyTypes } from '../../../users/types';
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

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name?: string;

  @Column({
    type: 'enum',
    enum: CompanyTypes,
  })
  type: CompanyTypes;

  @OneToMany(() => User, (user) => user.company)
  users?: User[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.company)
  auditLogs?: AuditLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}