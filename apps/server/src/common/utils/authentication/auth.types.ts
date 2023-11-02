import { Request } from 'express';

export interface IRequest extends Request {
  // TODO Add user type here when implemented
  user: any;
}
