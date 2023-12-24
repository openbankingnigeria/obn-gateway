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
import { CollectionRoute } from './collectionroute.entity';
import { Company } from './company.entity';

@Entity({ name: 'consumer_acls' })
export class ConsumerAcl {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @JoinColumn({ name: 'route_id' })
  @ManyToOne(() => CollectionRoute, (collectionRoute) => collectionRoute.acls)
  route: CollectionRoute;

  @Column({ name: 'route_id', nullable: false, default: null, length: 36 })
  routeId: string;

  @JoinColumn({ name: 'company_id' })
  @ManyToOne(() => Company, (company) => company.acls)
  company: Company;

  @Column({ name: 'company_id', nullable: false, default: null, length: 36 })
  companyId: string;

  @Column({ name: 'acl_id', nullable: false })
  aclId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
