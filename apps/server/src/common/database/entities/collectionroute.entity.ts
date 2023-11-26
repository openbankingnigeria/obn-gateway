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
import { Collection } from './collection.entity';

@Entity({ name: 'api_collection_service_routes' })
export class CollectionRoute {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name: string;

  @Column()
  serviceId: string;

  @Column()
  routeId: string;

  @Column({ type: 'boolean' })
  enabled: boolean;

  @JoinColumn({ name: 'collection_id' })
  @ManyToOne(() => Collection, { nullable: true })
  collection: Collection;

  @Column({ name: 'collection_id', nullable: true, length: 36 })
  collectionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
