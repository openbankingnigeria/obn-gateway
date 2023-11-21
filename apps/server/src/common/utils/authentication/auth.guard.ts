import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRED_PERMISSION_METADATA_KEY,
  SKIP_AUTH_METADATA_KEY,
} from './auth.decorator';
import { IRequest } from './auth.types';
import { IUnauthorizedException } from '../exceptions/exceptions';
import { Auth } from './auth.helper';
import { authErrors } from 'src/common/constants/errors/auth.errors';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/database/entities';
import { IsNull, Not, Repository } from 'typeorm';
import { PERMISSIONS } from 'src/permissions/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: Auth,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async canActivate(context: ExecutionContext) {
    const shouldSkipAuth = <boolean>(
      this.reflector.get(SKIP_AUTH_METADATA_KEY, context.getHandler())
    );

    const requiredPermission = <PERMISSIONS>(
      this.reflector.get(REQUIRED_PERMISSION_METADATA_KEY, context.getHandler())
    );

    if (shouldSkipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IRequest>();

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

    const user = await this.userRepository.findOne({
      where: {
        id: decoded.id,
        role: { parentId: Not(IsNull()) },
      },
      relations: {
        role: {
          permissions: true,
          parent: true,
        },
      },
    });

    if (!user) {
      throw new IUnauthorizedException({
        message: authErrors.invalidCredentials,
      });
    }

    if (
      user.role.slug !== 'admin' &&
      requiredPermission &&
      !user.role.permissions.some(
        (permission) => permission.permission?.slug === requiredPermission,
      )
    ) {
      throw new IUnauthorizedException({
        message: authErrors.inadequatePermissions,
      });
    }

    request.user = user;

    return true;
  }
}
