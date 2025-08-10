import type { MatcherContext, ExpectationResult } from 'expect';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEntity(): R;
      toMatchErrorSnapshot(): R;
      toBePaginated(): R;
    }
  }
}

export const entityMatchers = {
  toBeValidEntity(
    this: MatcherContext,
    received: any
  ): ExpectationResult {
    const pass = 
      received?.id !== undefined &&
      received?.createdAt instanceof Date;

    return {
      pass,
      message: () => `Expected ${this.utils.printReceived(received)} to be a valid entity`
    };
  }
};

export const paginationMatchers = {
  toBePaginated(
    this: MatcherContext,
    received: any
  ): ExpectationResult {
    const pass = 
      Array.isArray(received?.data) &&
      typeof received?.total === 'number';

    return {
      pass,
      message: () => `Expected paginated response, got ${this.utils.printReceived(received)}`
    };
  }
};

// Export all matchers at the bottom
export const matchers = {
  ...entityMatchers,
  ...paginationMatchers
};

export type { MatcherContext, ExpectationResult };