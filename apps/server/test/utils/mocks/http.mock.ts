import { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';
import { RequestContext } from '@common/utils/request/request-context';
import { User } from '@common/database/entities';
import { ResponseDTO, ResponseFormatter } from '@common/utils/response/response.formatter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PERMISSIONS } from '@permissions/types';
import { CompanyBuilder, RoleBuilder, UserBuilder } from '../builders';

export interface IRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  ctx: RequestContext;
}

interface MockContext<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> {
  req: IRequest<P, ResBody, ReqBody, ReqQuery>;
  res: Response & { body: ResponseDTO<ResBody> };
  user?: User;
  permissions?: (typeof PERMISSIONS)[keyof typeof PERMISSIONS][];
  eventEmitter?: jest.Mocked<EventEmitter2>;
}

export const createMockRequest = <
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
>(
  overrides: Partial<IRequest<P, ResBody, ReqBody, ReqQuery>> = {}
): IRequest<P, ResBody, ReqBody, ReqQuery> => ({
  params: {} as P,
  query: {} as ReqQuery,
  body: {} as ReqBody,
  headers: {},
  get: jest.fn(),
  ctx: new RequestContext({ user: new User() }),
  ...overrides,
} as IRequest<P, ResBody, ReqBody, ReqQuery>);

export const createMockResponse = <T = any>(): Response & { body: ResponseDTO<T> } => {
  const res: any = {
    body: ResponseFormatter.success("", undefined, undefined),
    statusCode: 200,
    headers: {},
    locals: {},

    status(code: number) {
      this.statusCode = code;
      if (code >= 400) {
        this.body = ResponseFormatter.error(`Error with status ${code}`);
      }
      return this;
    },

    json(body: any) {
      if (this.statusCode >= 400) {
        this.body = ResponseFormatter.error(body.message || 'Error occurred');
      } else {
        this.body = ResponseFormatter.success(body?.message, body?.data, body?.meta);
      }
      return this;
    },

    send(body: any) {
      if (typeof body === 'object') {
        if (body.status === 'error' || this.statusCode >= 400) {
          this.body = ResponseFormatter.error(body.message || 'Error occurred');
        } else {
          this.body = ResponseFormatter.success(body?.message, body?.data, body?.meta);
        }
      } else if (this.statusCode >= 400) {
        this.body = ResponseFormatter.error(body?.toString() || 'Error occurred');
      }
      return this;
    },

    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },

    getHeader(name: string) {
      return this.headers[name];
    },
  };

  return res as Response & { body: ResponseDTO<T> };
};

export const mockEventEmitter = (): jest.Mocked<EventEmitter2> => {
  const mock = {
    emit: jest.fn<boolean, [string | symbol | Array<string | symbol>, ...any[]]>(),
    emitAsync: jest.fn<Promise<any[]>, [string | symbol | Array<string | symbol>, ...any[]]>(),
  } as unknown as jest.Mocked<EventEmitter2>;

  mock.emit.mockReturnValue(true);
  mock.emitAsync.mockResolvedValue([]);

  return mock;
};

export const createMockContext = <
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
>(
  overrides: Partial<MockContext<P, ResBody, ReqBody, ReqQuery>> & {
    user?: User;
    permissions?: (typeof PERMISSIONS)[keyof typeof PERMISSIONS][];
  } = {}
): MockContext<P, ResBody, ReqBody, ReqQuery> & { ctx: RequestContext } => {
  const ctx = {
    req: createMockRequest<P, ResBody, ReqBody, ReqQuery>(),
    res: createMockResponse<ResBody>(),
    eventEmitter: mockEventEmitter(),
    ...overrides,
  };

  const user = overrides.user ?? new UserBuilder()
    .with("company", new CompanyBuilder().build())
    .with("role", new RoleBuilder().build())
    .build();

  const requestContext = new RequestContext({ user });

  if (overrides.permissions) {
    jest.spyOn(requestContext, 'hasPermission').mockImplementation(
      (requiredPermission?: (typeof PERMISSIONS)[keyof typeof PERMISSIONS]) => {
        if (!requiredPermission) return false;
        return overrides.permissions?.includes(requiredPermission) ?? false;
      }
    );
  }

  ctx.req.ctx = requestContext;

  return {
    ...ctx,
    ctx: requestContext,
  };
};

export const mockHttpService = {
  get: jest.fn<Promise<ResponseDTO>, [string, any?]>(),
  post: jest.fn<Promise<ResponseDTO>, [string, any?, any?]>(),
  put: jest.fn<Promise<ResponseDTO>, [string, any?, any?]>(),
  delete: jest.fn<Promise<ResponseDTO>, [string, any?]>(),
  axiosRef: {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
};

export const mockEntity = <T extends Record<string, any>>(
  defaults: Partial<T> = {}
): jest.Mocked<T> => {
  return {
    ...defaults,
    save: jest.fn().mockImplementation(function(this: T) {
      return Promise.resolve({ ...this, ...arguments[0] });
    }),
    remove: jest.fn(),
    reload: jest.fn(),
  } as unknown as jest.Mocked<T>;
};