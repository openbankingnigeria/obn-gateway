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
  IForbiddenException,
  IPreconditionFailedException,
  IUnauthorizedException,
} from '../exceptions/exceptions';
import { Auth } from './auth.helper';
import { authErrors } from '@auth/auth.errors';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@common/database/entities';
import { Equal, IsNull, Not, Repository } from 'typeorm';
import { PERMISSIONS } from 'src/permissions/types';
import * as speakeasy from 'speakeasy';
import moment from 'moment';
import { RequestContext } from '../request/request-context';

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

    const requiredPermission = <(typeof PERMISSIONS)[keyof typeof PERMISSIONS]>(
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

    // TODO get back to this, use central getUserById implementation
    const user = await this.userRepository.findOne({
      where: {
        id: Equal(decoded.id),
        role: { parentId: Not(IsNull()) },
      },
      relations: {
        role: {
          permissions: true,
          parent: { permissions: true },
        },
        company: true,
      },
    });

    if (!user?.company) {
      throw new IUnauthorizedException({
        message: authErrors.invalidCredentials,
      });
    }

    request.ctx = new RequestContext({
      user,
    });

    if (!moment(user.lastLogin).isSame(decoded?.iat * 1000, 'second')) {
      throw new IUnauthorizedException({
        message: authErrors.invalidCredentials,
      });
    }

    if (!request.ctx.hasPermission(requiredPermission)) {
      throw new IForbiddenException({
        message: authErrors.inadequatePermissions(requiredPermission),
      });
    }

    if (strictRequireTwoFA !== undefined) {
      if (strictRequireTwoFA === true) {
        if (!twoFACode) {
          throw new IBadRequestException({
            message: authErrors.twoFARequired,
          });
        }
        if (!user.twofaEnabled) {
          throw new IPreconditionFailedException({
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

    return true;
  }
}
