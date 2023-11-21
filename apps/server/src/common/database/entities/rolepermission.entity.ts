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
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'role_permissions' })
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  @ManyToOne(() => Role, { nullable: false })
  role?: Role;

  @Column({ name: 'role_id', nullable: false, default: null, length: 36 })
  roleId?: string;

  @JoinColumn({ name: 'permission_id', referencedColumnName: 'id' })
  @ManyToOne(() => Permission, { nullable: false })
  permission?: Permission;

  @Column({ name: 'permission_id', nullable: false, default: null, length: 36 })
  permissionId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
