import { Request } from 'express';
import { Company, User } from 'src/common/database/entities';

export interface IRequest extends Request {
  user?: User & { company: Company };
}
