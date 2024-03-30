import { CompanyTypes } from '@common/database/constants';
import { IRequest } from '@common/utils/authentication/auth.types';
import {
  IForbiddenException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class APIInterceptor implements NestInterceptor {
  constructor(private readonly config: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<IRequest>();

    if (request.params.environment !== KONG_ENVIRONMENT.DEVELOPMENT) {
      if (
        (!request.ctx.activeCompany.isVerified ||
          request.ctx.activeCompany.kybStatus !== 'approved') &&
        request.ctx.activeCompany.type !== CompanyTypes.API_PROVIDER
      ) {
        return throwError(
          () =>
            new IForbiddenException({
              message: `Cannot access this environment`,
            }),
        );
      }
    }

    if (!this.config.get('kong.adminEndpoint')[request.params.environment]) {
      return throwError(
        () =>
          new INotFoundException({
            message: 'Environment does not exist',
          }),
      );
    }

    return next.handle();
  }
}
