import type { MatcherContext, ExpectationResult } from 'expect';
import { ClassConstructor } from 'class-transformer';
import 'jest-chain';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEntity<T extends object>(expectedType?: ClassConstructor<T>): R;
      toBePaginatedResponse<T = any>(): R;
      toBeDtoResponse<T extends object>(expectedType: ClassConstructor<T>): R;
      toMatchErrorStructure(expectedStructure: object): R;
      toBeArrayOf<T extends object>(expectedType: ClassConstructor<T>): R;
      toHaveNestedProperty(path: string, value?: any): R;
      toBeUuid(): R;
      toBeIsoDate(): R;
      toBeResponseWithStatus(expectedStatus: number): R;
      toContainEntity<T extends object>(expectedType: ClassConstructor<T>): R;
      toBeWithinRange(floor: number, ceiling: number): R;
      toBeValidUUID(): R;
      toBeValidDate(): R;
      toBeValidEmail(): R;
      toBeValidPhoneNumber(): R;
      toBeValidUrl(): R;
    }
  }
}

export const entityMatchers = {
  toBeValidEntity<T extends object>(
    this: MatcherContext,
    received: any,
    expectedType?: ClassConstructor<T>,
  ): ExpectationResult {
    const idPass = received?.id !== undefined;
    const datePass =
      received?.createdAt instanceof Date ||
      received?.created_at instanceof Date ||
      received?.updatedAt instanceof Date;

    const typePass =
      !expectedType ||
      received instanceof expectedType ||
      received?.constructor?.name === expectedType.name;

    return {
      pass: idPass && (datePass || !expectedType) && typePass,
      message: () => {
        const missing = [];
        if (!idPass) missing.push('id');
        if (!datePass && expectedType) missing.push('createdAt/updatedAt');
        if (!typePass && expectedType)
          missing.push(`type ${expectedType.name}`);

        return missing.length
          ? `Missing required entity properties: ${missing.join(', ')} in ${this.utils.printReceived(received)}`
          : `Expected valid ${expectedType?.name || 'entity'}`;
      },
    };
  },

  toBePaginatedResponse(
    this: MatcherContext,
    received: any,
  ): ExpectationResult {
    const paginationPatterns = [
      // Pattern 1: { data: T[], total: number }
      () =>
        Array.isArray(received?.data) && typeof received?.total === 'number',
      // Pattern 2: { items: T[], meta: { total: number } }
      () =>
        Array.isArray(received?.items) &&
        typeof received?.meta?.total === 'number',
      // Pattern 3: NestJS-style with ResponseFormatter
      () =>
        Array.isArray(received?.data) &&
        typeof received?.meta?.totalNumberOfRecords === 'number',
    ];

    const pass = paginationPatterns.some((pattern) => pattern());

    return {
      pass,
      message: () =>
        `Expected paginated response (data[]+total or items[]+meta.total), got ${this.utils.printReceived(received)}`,
    };
  },

  toBeDtoResponse<T extends object>(
    this: MatcherContext,
    received: any,
    expectedType: ClassConstructor<T>,
  ): ExpectationResult {
    const expectedKeys = Object.keys(new expectedType());
    const missingKeys = expectedKeys.filter((key) => !(key in received));
    const extraKeys = Object.keys(received).filter(
      (key) => !expectedKeys.includes(key),
    );

    return {
      pass: missingKeys.length === 0,
      message: () =>
        `DTO validation failed for ${expectedType.name}\n` +
        `Missing: ${missingKeys.join(', ')}\n` +
        `Unexpected: ${extraKeys.join(', ')}`,
    };
  },

  toMatchErrorStructure(
    this: MatcherContext,
    received: any,
    expectedStructure: object,
  ): ExpectationResult {
    const structureKeys = Object.keys(expectedStructure);
    const missingKeys = structureKeys.filter((key) => !(key in received));

    return {
      pass: missingKeys.length === 0,
      message: () =>
        `Error structure validation failed\n` +
        `Missing keys: ${missingKeys.join(', ')}\n` +
        `Received: ${JSON.stringify(received, null, 2)}`,
    };
  },

  toBeArrayOf<T extends object>(
    this: MatcherContext,
    received: any,
    expectedType: ClassConstructor<T>,
  ): ExpectationResult {
    if (!Array.isArray(received)) {
      return {
        pass: false,
        message: () => `Expected array, got ${typeof received}`,
      };
    }

    const invalidItems = received
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !(item instanceof expectedType));

    return {
      pass: invalidItems.length === 0,
      message: () =>
        invalidItems.length > 0
          ? `Invalid items at positions: ${invalidItems.map((x) => x.index).join(', ')}\n` +
            `Expected all items to be ${expectedType.name}`
          : `All items are valid ${expectedType.name} instances`,
    };
  },

  toHaveNestedProperty(
    this: MatcherContext,
    received: any,
    path: string,
    value?: any,
  ): ExpectationResult {
    const parts = path.split('.');
    let current = received;

    for (const part of parts) {
      if (current === undefined) break;
      current = current[part];
    }

    const pass =
      value !== undefined ? current === value : current !== undefined;

    return {
      pass,
      message: () =>
        value !== undefined
          ? `Expected ${path} to be ${value}, got ${current}`
          : `Expected property ${path} to exist`,
    };
  },

  toBeUuid(this: MatcherContext, received: any): ExpectationResult {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);

    return {
      pass,
      message: () =>
        `Expected UUID string, got ${this.utils.printReceived(received)}`,
    };
  },

  toBeIsoDate(this: MatcherContext, received: any): ExpectationResult {
    const pass =
      typeof received === 'string' &&
      !isNaN(Date.parse(received)) &&
      new Date(received).toISOString() === received;

    return {
      pass,
      message: () =>
        `Expected ISO date string, got ${this.utils.printReceived(received)}`,
    };
  },
};

export const paginationMatchers = {
  toBePaginatedResponse(
    this: MatcherContext,
    received: any,
  ): ExpectationResult {
    const paginationPatterns = [
      // Standard { data, total } pattern
      () =>
        Array.isArray(received?.data) && typeof received?.total === 'number',
      // { items, meta } pattern
      () =>
        Array.isArray(received?.items) &&
        typeof received?.meta?.total === 'number',
      // NestJS ResponseFormatter pattern
      () =>
        Array.isArray(received?.data) &&
        typeof received?.meta?.totalNumberOfRecords === 'number',
      // Offset/limit pattern
      () =>
        Array.isArray(received?.results) &&
        typeof received?.offset === 'number',
    ];

    const pass = paginationPatterns.some((pattern) => pattern());

    return {
      pass,
      message: () =>
        `Expected paginated response structure, got: ${this.utils.printReceived(received)}`,
    };
  },

  toContainPagedEntity<T extends object>(
    this: MatcherContext,
    received: any,
    expectedType: ClassConstructor<T>,
  ): ExpectationResult {
    const array = received?.data || received?.items || received?.results;
    const pass =
      Array.isArray(array) &&
      array.some((item) => item instanceof expectedType);

    return {
      pass,
      message: () =>
        `Expected paginated response to contain ${expectedType.name}`,
    };
  },
};

export const responseMatchers = {
  toBeResponseWithStatus(
    this: MatcherContext,
    received: any,
    expectedStatus: number,
  ): ExpectationResult {
    const pass = received?.status === expectedStatus;

    return {
      pass,
      message: () =>
        `Expected response with status ${expectedStatus}, got ${received?.status}`,
    };
  },

  toBeApiResponse<T extends object>(
    this: MatcherContext,
    received: any,
    expectedType?: ClassConstructor<T>,
  ): ExpectationResult {
    const basePass = received?.message && received?.data !== undefined;
    const typePass =
      !expectedType ||
      received?.data instanceof expectedType ||
      (Array.isArray(received?.data) &&
        received.data.every((item: any) => item instanceof expectedType));

    return {
      pass: basePass && typePass,
      message: () =>
        `Expected API response with ${expectedType?.name || 'any'} data`,
    };
  },

  toHaveResponseMeta(
    this: MatcherContext,
    received: any,
    expectedMetaKeys: string[],
  ): ExpectationResult {
    const missingKeys = expectedMetaKeys.filter(
      (key) => !(key in received?.meta),
    );

    return {
      pass: missingKeys.length === 0,
      message: () => `Missing meta keys: ${missingKeys.join(', ')}`,
    };
  },
};

export const utilityMatchers = {
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },

  toBeValidUUID(received: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`,
      pass,
    };
  },

  toBeValidDate(received: Date | string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid date`,
      pass,
    };
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
      pass,
    };
  },
};

export const matchers = {
  ...entityMatchers,
  ...paginationMatchers,
  ...responseMatchers,
  ...utilityMatchers,
};

export type { MatcherContext, ExpectationResult };
