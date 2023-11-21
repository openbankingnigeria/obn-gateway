import { Request } from 'express';
import { User } from 'src/common/database/entities';

export interface IRequest extends Request {
  user?: User;
}
