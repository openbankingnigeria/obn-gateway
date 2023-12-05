import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { RolePermission } from './rolepermission.entity';
import { Company } from './company.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'roles' })
@Unique(['slug', 'parent', 'company'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name?: string;

  @Column()
  slug?: string;

  @Column({ type: 'text' })
  description?: string;

  @Column()
  status?: string;

  @JoinColumn({ name: 'parent_id' })
  @ManyToOne(() => Role, { nullable: true })
  parent?: Role;

  @Column({ name: 'parent_id', nullable: true, length: 36 })
  parentId: string;

  @JoinColumn({ name: 'company_id' })
  @ManyToOne(() => Company, { nullable: true })
  company: Company;

  @Column({ name: 'company_id', nullable: true, length: 36 })
  companyId: string;

  @OneToMany(() => RolePermission, (permission) => permission.role)
  rolePermissions: RolePermission[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
    synchronize: false,
  })
  permissions: Permission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
