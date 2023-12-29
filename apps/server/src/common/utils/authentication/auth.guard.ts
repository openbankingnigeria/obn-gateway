import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRED_PERMISSION_METADATA_KEY,
  REQUIRE_TWO_FA_KEY,
  SKIP_AUTH_METADATA_KEY,
} from './auth.decorator';
import { IRequest } from './auth.types';
import {
  IBadRequestException,
  IUnauthorizedException,
} from '../exceptions/exceptions';
import { Auth } from './auth.helper';
import { authErrors } from '@auth/auth.errors';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/database/entities';
import { IsNull, Not, Repository } from 'typeorm';
import { PERMISSIONS } from 'src/permissions/types';
import * as speakeasy from 'speakeasy';
import * as moment from 'moment';

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

    const strictRequireTwoFA = <boolean | undefined>(
      this.reflector.get(REQUIRE_TWO_FA_KEY, context.getHandler())
    );

    if (shouldSkipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IRequest>();

    const accessToken = request.headers.authorization?.replace(/^Bearer\s/, '');
    const twoFACode = request.get('x-twofa-code');

    if (!accessToken) {
      throw new IUnauthorizedException({
        message: authErrors.accessTokenNotProvided,
      });
    }

    let decoded: { id: string; iat: number };
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

    // TODO ensure user permission exists within parent's too
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
        company: true,
      },
    });

    if (!user || !user.company) {
      throw new IUnauthorizedException({
        message: authErrors.invalidCredentials,
      });
    }

    if (!moment(user.lastLogin).isSame(decoded?.iat * 1000, 'second')) {
      throw new IUnauthorizedException({
        message: authErrors.invalidCredentials,
      });
    }

    // TODO remove.
    if (
      user.role.slug !== 'admin' &&
      requiredPermission &&
      !user.role.permissions.some(
        (permission) => permission?.slug === requiredPermission,
      )
    ) {
      throw new IUnauthorizedException({
        message: authErrors.inadequatePermissions,
      });
    }

    if (strictRequireTwoFA !== undefined) {
      if (strictRequireTwoFA === true) {
        if (!twoFACode || !user.twofaEnabled) {
          throw new IBadRequestException({
            message: authErrors.twoFARequired,
          });
        }
      } else if (user.twofaEnabled && !twoFACode) {
        throw new IBadRequestException({
          message: authErrors.provideTwoFA,
        });
      }
      if (user.twofaEnabled) {
        const verified = speakeasy.totp.verify({
          secret: user.twofaSecret!,
          encoding: 'base32',
          token: twoFACode!,
        });
        if (!verified) {
          throw new IBadRequestException({
            message: authErrors.invalidTwoFA,
          });
        }
      }
    }

    request.user = user as IRequest['user'];

    return true;
  }
}
