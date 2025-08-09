import { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

export const createMockRequest = <P = ParamsDictionary, Q = ParsedQs>(
  overrides: Partial<Request<P, any, any, Q>> = {}
): Request<P, any, any, Q> => ({
  params: {} as P,
  query: {} as Q,
  body: {},
  headers: {},
  ...overrides
} as Request<P, any, any, Q>);

export const createMockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res as Response;
};

interface MockContext {
  req: Request;
  res: Response;
  [key: string]: any;
}

export const createMockContext = (overrides: Partial<MockContext> = {}): MockContext => ({
  req: createMockRequest(),
  res: createMockResponse(),
  ...overrides
});

export const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  axiosRef: {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
};