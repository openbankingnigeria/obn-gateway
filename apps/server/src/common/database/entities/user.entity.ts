import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Profile } from './profile.entity';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @PrimaryColumn()
  email: string;

  @Column()
  password: string;

  @Column()
  status?: string;

  @JoinColumn({ name: 'role', referencedColumnName: 'id' })
  @ManyToOne(() => Role, { nullable: false })
  role: Role;

  @Column({ name: 'role', nullable: false, default: null, length: 36 })
  roleId: string;

  @ManyToOne(() => Company, (company) => company.users, { cascade: ['insert'] })
  @JoinColumn({ name: 'company', referencedColumnName: 'id' })
  company: Company;

  @Column({ name: 'company', length: 36 })
  companyId: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
  })
  profile: Profile;

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken?: string;

  @Column({ name: 'reset_password_expires', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ name: 'last_password_change', nullable: true })
  lastPasswordChange?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
