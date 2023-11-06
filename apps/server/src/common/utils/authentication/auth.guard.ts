import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH_METADATA_KEY } from './auth.decorator';
import { IRequest } from './auth.types';
import { IUnauthorizedException } from '../exceptions/exceptions';
import { Auth } from './auth.helper';
import { authErrors } from 'src/common/constants/errors/auth.errors';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: Auth,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    let decoded: { id: string };
    try {
      decoded = await this.auth.verify(accessToken);
    } catch (err) {
      console.log({ err: err.name, message: err.message });
      throw new IUnauthorizedException({
        message: authErrors.invalidCredentials,
        _meta: err,
      });
    }

    if (!decoded?.id) {
      throw new IUnauthorizedException({
        message: authErrors.invalidCredentials,
      });
    }

    const user = await this.userRepository.findOneBy({
      id: decoded.id,
    });

    if (!user) {
      throw new IUnauthorizedException({
        message: authErrors.invalidCredentials,
      });
    }

    if (user.password) {
      delete (user as any).password;
    }

    request.user = user;

    return true;
  }
}
