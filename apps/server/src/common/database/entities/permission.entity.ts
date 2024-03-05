import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { RolePermission } from './rolepermission.entity';
import { PERMISSIONS } from '../../../permissions/types';

@Entity({ name: 'permissions' })
@Unique(['slug'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name?: string;

  @Column()
  slug?: (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

  @Column({ type: 'text' })
  description?: string;

  @OneToMany(() => RolePermission, (role) => role.permission)
  roles: RolePermission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
