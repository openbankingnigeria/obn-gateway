import { Request } from 'express';
import { RequestContext } from '../request/request-context';

export interface IRequest extends Request {
  ctx: RequestContext;
}
