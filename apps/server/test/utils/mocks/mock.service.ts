import { EntityBuilder } from '@utils/builders';
import { faker } from '@faker-js/faker';
import { ResponseDTO } from '@common/utils/response/response.formatter';

type MethodStubs<T> = {
  [K in keyof T]?: jest.Mock;
};

type BuilderMap<T> = {
  [K in keyof T]?: EntityBuilder<any>;
};

export class MockService<T> {
  private builderMap: BuilderMap<T>;
  private serviceStubs: MethodStubs<T>;
  private defaultBuilder: EntityBuilder<any>;
  private successMessages: Record<string, string>;

  constructor(
    defaultBuilder: EntityBuilder<any>,
    options: {
      builderMap?: BuilderMap<T>;
      stubs?: MethodStubs<T>;
      successMessages?: Record<string, string>;
    } = {}
  ) {
    this.defaultBuilder = defaultBuilder;
    this.builderMap = options.builderMap || {};
    this.serviceStubs = options.stubs || {};
    this.successMessages = options.successMessages || {};
  }

  private formatSuccessResponse(message: string, data: any, meta?: any) {
    return {
      status: 'success',
      message,
      data: new ResponseDTO({
        status: 'success',
        message,
        data,
        meta
      })
    };
  }

  getMock(): jest.Mocked<T> {
    const mock: any = {};

    const defaults = {
      create: jest.fn().mockImplementation((ctx: any, dto: any) => {
        const builder = this.builderMap['create' as keyof T] || this.defaultBuilder.clone();
        return Promise.resolve(
          this.formatSuccessResponse(
            this.successMessages['create'] || 'Created successfully',
            builder.build()
          )
        );
      }),

      findOne: jest.fn().mockImplementation((ctx: any, id: string) => {
        const builder = this.builderMap['findOne' as keyof T] || this.defaultBuilder.clone();
        return Promise.resolve(
          this.formatSuccessResponse(
            this.successMessages['findOne'] || 'Found successfully',
            builder.build()
          )
        );
      }),

      findAll: jest.fn().mockImplementation(() => {
        const builder = this.builderMap['findAll' as keyof T] || this.defaultBuilder.clone();
        const data = [
          builder.clone().build(),
          builder.clone().build()
        ];
        return Promise.resolve(
          this.formatSuccessResponse(
            this.successMessages['findAll'] || 'List retrieved successfully',
            data,
            {
              totalNumberOfRecords: data.length,
              totalNumberOfPages: 1,
              pageNumber: 1,
              pageSize: 10
            }
          )
        );
      }),

      update: jest.fn().mockImplementation((ctx: any, id: string, dto: any) => {
        const builder = this.builderMap['update' as keyof T] || this.defaultBuilder.clone();
        return Promise.resolve(
          this.formatSuccessResponse(
            this.successMessages['update'] || 'Updated successfully',
            builder.build()
          )
        );
      }),

      delete: jest.fn().mockResolvedValue(
        this.formatSuccessResponse(
          this.successMessages['delete'] || 'Deleted successfully',
          { success: true }
        )
      ),
    };

    // Apply user stubs first (they override defaults)
    Object.entries(this.serviceStubs).forEach(([method, stub]) => {
      mock[method] = stub;
    });

    // Then apply defaults for any remaining methods
    Object.entries(defaults).forEach(([method, stub]) => {
      if (!mock[method]) {
        mock[method] = stub;
      }
    });

    return mock as jest.Mocked<T>;
  }

  static createWithBuilder<T>(
    builder: EntityBuilder<any>,
    options: {
      stubs?: MethodStubs<T>;
      successMessages?: Record<string, string>;
    } = {}
  ): jest.Mocked<T> {
    return new MockService<T>(builder, {
      stubs: options.stubs,
      successMessages: options.successMessages
    }).getMock();
  }

  static createPaginated<T>(
    builder: EntityBuilder<any>,
    options: {
      count?: number;
      min?: number;
      max?: number;
      stubs?: MethodStubs<T>;
      methodName?: keyof T;
      successMessage?: string;
    } = {}
  ): jest.Mocked<T> {
    const count = options.count ?? faker.number.int({ 
      min: options.min ?? 2, 
      max: options.max ?? 10 
    });
    
    const data = Array(count)
      .fill(null)
      .map(() => builder.clone().build());

    const methodName = options.methodName || 'findAll' as keyof T;

    return new MockService<T>(builder, {
      stubs: {
        [methodName]: jest.fn().mockResolvedValue({
          status: 'success',
          message: options.successMessage || 'List retrieved successfully',
          data: new ResponseDTO({
            status: 'success',
            message: options.successMessage || 'List retrieved successfully',
            data,
            meta: {
              totalNumberOfRecords: count,
              totalNumberOfPages: 1,
              pageNumber: 1,
              pageSize: 10
            }
          })
        }),
        ...options.stubs,
      }
    }).getMock();
  }
}