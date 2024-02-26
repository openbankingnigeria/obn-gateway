import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity({ name: 'company_kyb_data' })
export class CompanyKybData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Company, (company) => company.kybData)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id', nullable: false })
  companyId: string;

  @Column('longblob', { nullable: true })
  data?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date | null;
}
