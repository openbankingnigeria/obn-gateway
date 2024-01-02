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

  @Column({
    name: 'twofa_secret',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  twofaSecret?: string;

  @Column({
    name: 'twofa_enabled',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  twofaEnabled: boolean;

  @Column({ default: UserStatuses.PENDING, type: 'enum', enum: UserStatuses })
  status?: UserStatuses;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  @ManyToOne(() => Role, { nullable: false })
  role: Role;

  @Column({ name: 'role_id', nullable: false, default: null, length: 36 })
  roleId: string;

  @Column({
    name: 'account_number',
  })
  accountNumber: string;

  @Column({ name: 'bvn' })
  bvn: string;

  @ManyToOne(() => Company, (company) => company.users, { cascade: ['insert'] })
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company?: Company;

  @Column({ name: 'company_id', length: 36 })
  companyId: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
  })
  profile?: Profile;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs?: AuditLog[];

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken?: string;

  @Column({ name: 'email_verification_otp', nullable: true })
  emailVerificationOtp?: string;

  @Column({ name: 'email_verification_expires', nullable: true })
  emailVerificationExpires?: Date;

  @Column({ name: 'reset_password_expires', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ name: 'last_password_change', nullable: true })
  lastPasswordChange?: Date;

  // TODO TZ for dates
  @Column({ name: 'last_login', nullable: true })
  lastLogin?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
