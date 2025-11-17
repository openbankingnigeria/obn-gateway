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
import { User } from './user.entity';

export enum SpecFormat {
  OPENAPI_V2 = 'openapi_v2',
  OPENAPI_V3 = 'openapi_v3',
  POSTMAN_V2 = 'postman_v2',
  POSTMAN_V21 = 'postman_v21',
}

export enum ImportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

@Entity({ name: 'imported_api_specs' })
export class ImportedApiSpec {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    name: 'spec_format',
    type: 'enum',
    enum: SpecFormat,
    nullable: false,
  })
  specFormat: SpecFormat;

  @Column({ name: 'spec_version', type: 'varchar', length: 50, nullable: true })
  specVersion: string;

  @Column({ name: 'original_spec', type: 'longtext' })
  originalSpec: string;

  @Column({ name: 'parsed_metadata', type: 'json', nullable: true })
  parsedMetadata: any;

  @Column({
    name: 'import_status',
    type: 'enum',
    enum: ImportStatus,
    default: ImportStatus.PENDING,
    nullable: false,
  })
  importStatus: ImportStatus;

  @Column({ name: 'imported_count', type: 'int', default: 0 })
  importedCount: number;

  @Column({ name: 'failed_count', type: 'int', default: 0 })
  failedCount: number;

  @Column({ name: 'error_log', type: 'json', nullable: true })
  errorLog: any[];

  @JoinColumn({ name: 'collection_id' })
  @ManyToOne(() => Collection, { nullable: false })
  collection: Collection;

  @Column({ name: 'collection_id', length: 36 })
  collectionId: string;

  @Column({ name: 'environment', type: 'varchar', length: 50 })
  environment: string;

  @JoinColumn({ name: 'imported_by_id' })
  @ManyToOne(() => User, { nullable: false })
  importedBy: User;

  @Column({ name: 'imported_by_id', length: 36 })
  importedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
