import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Profile } from './profile.entity';
import { Role } from './role.entity';
import { AuditLog } from './auditlog.entity';

export enum UserStatuses {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @PrimaryColumn()
  email: string;

  @Column()
  password?: string;

  @Column()
  twofaSecret?: string;

  @Column()
  twofaEnabled: boolean;

  @Column({ default: UserStatuses.PENDING, type: 'enum', enum: UserStatuses })
  status?: UserStatuses;

  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  @ManyToOne(() => Role, { nullable: false })
  role: Role;

  @Column({ name: 'role_id', nullable: false, default: null, length: 36 })
  roleId: string;

  @ManyToOne(() => Company, (company) => company.users, { cascade: ['insert'] })
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: Company;

  @Column({ name: 'company_id', length: 36 })
  companyId: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
  })
  profile: Profile;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs?: AuditLog[];

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken?: string;

  @Column({ name: 'reset_password_expires', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ name: 'last_password_change', nullable: true })
  lastPasswordChange?: Date;

  @Column({ name: 'last_login', nullable: true })
  lastLogin?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
