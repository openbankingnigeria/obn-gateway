import { IRequest } from '@common/utils/authentication/auth.types';
import { IForbiddenException } from '@common/utils/exceptions/exceptions';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class APIInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<IRequest>();

    if (request.params.environment !== KONG_ENVIRONMENT.DEVELOPMENT) {
      if (!request.ctx.activeCompany.isVerified || request.ctx.activeCompany.kybStatus !== 'approved') {
        return throwError(() => new IForbiddenException({
          message: `Cannot access this environment`,
        }));
      }
    }

    return next.handle();
  }
}