import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolePermission } from './rolepermission.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name?: string;

  @Column()
  description?: string;

  @Column()
  status?: string;

  @JoinColumn({ name: 'parent' })
  @ManyToOne(() => Role, { nullable: true })
  parent?: Role;

  @Column({ name: 'parent', nullable: true, length: 36 })
  parentId: string;

  @OneToMany(() => RolePermission, (permission) => permission.role)
  permissions: RolePermission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
