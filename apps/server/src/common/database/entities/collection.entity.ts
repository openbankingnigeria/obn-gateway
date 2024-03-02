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
import { CollectionRoute } from './collectionroute.entity';

@Entity({ name: 'api_collections' })
@Unique(['slug'])
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name?: string;

  @Column()
  slug?: string;

  @Column({ type: 'text' })
  description?: string;

  @OneToMany(() => CollectionRoute, (route) => route.collection)
  apis?: CollectionRoute[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
