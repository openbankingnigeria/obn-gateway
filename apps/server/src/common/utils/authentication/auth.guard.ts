import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH_METADATA_KEY } from './auth.decorator';
import { IRequest } from './auth.types';
import { IUnauthorizedException } from '../exceptions/exceptions';
import { Auth } from './auth.helper';
import { authErrors } from 'src/common/constants/errors/auth.errors';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: Auth,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<IRequest>();

    const shouldSkipAuth = <boolean>(
      this.reflector.get(SKIP_AUTH_METADATA_KEY, context.getHandler())
    );

    if (shouldSkipAuth) {
      return true;
    }

    const accessToken = request.headers.authorization?.replace(/^Bearer\s/, '');

    if (!accessToken) {
      throw new IUnauthorizedException({
        message: authErrors.accessTokenNotProvided,
      });
    }

    const { id } = await this.auth.verify<{ id: string }>(accessToken);

    console.log({ id });

    return true;
  }
}
