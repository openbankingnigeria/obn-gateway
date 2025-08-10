import { ObjectLiteral, DeepPartial, Repository } from 'typeorm';

export const createMockRepository = <T extends ObjectLiteral>(): jest.Mocked<Repository<T>> => {
  const mock: jest.Mocked<Repository<T>> = {
    // Basic CRUD operations
    save: jest.fn((entity: T) => Promise.resolve(entity)),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    query: jest.fn(),
    softDelete: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn((dto: DeepPartial<T>) => dto as T),
    
    // Query builder
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis()
    })),

    // Minimal metadata
    metadata: {
      columns: [],
      relations: [],
      // Cast to bypass TypeScript checks for other metadata properties
    } as any,

    // Cast the entire object to bypass TypeScript checks for missing properties
  } as unknown as jest.Mocked<Repository<T>>;

  return mock;
};

export type MockRepository<T extends ObjectLiteral> = jest.Mocked<Repository<T>>;