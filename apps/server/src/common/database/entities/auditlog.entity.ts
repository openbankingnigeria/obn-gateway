import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog<T = any> {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  event: string;

  @Column({ type: 'json', nullable: true })
  details?: T;

  @ManyToOne(() => Company, (company) => company.auditLogs)
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: Company;

  @Column({ name: 'company_id', length: 36 })
  companyId: string;

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ name: 'user_id', length: 36 })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
