import {
  BeforeInsert,
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
import { hash } from 'bcrypt';
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

  @BeforeInsert()
  async beforeInsert() {
    console.log('HERe');
    this.password = await hash(this.password, 12);
    this.email = this.email.trim().toLowerCase();
  }

  @JoinColumn({ name: 'role' })
  @ManyToOne(() => Role, { nullable: true })
  role: Role | null;

  @Column({ name: 'role', nullable: true })
  roleId: string;

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company', referencedColumnName: 'id' })
  company: Company;

  @Column({ name: 'company' })
  companyId: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
  })
  @JoinColumn({ name: 'profile', referencedColumnName: 'id' })
  profile: Profile;

  @Column({ name: 'profile' })
  profileId: string;

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
