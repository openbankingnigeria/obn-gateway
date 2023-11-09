import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { IRequest } from '../authentication/auth.types';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: IRequest) {}

  get user() {
    return this.request.user;
  }
}
