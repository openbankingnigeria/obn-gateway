import { ObjectLiteral, DeepPartial, Repository } from 'typeorm';

export const createMockRepository = <T extends ObjectLiteral>(): jest.Mocked<Repository<T>> => {
  const mock: jest.Mocked<Repository<T>> = {
    // Basic CRUD operations
    save: jest.fn((entity: T) => Promise.resolve(entity)),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOneBy: jest.fn(),
    findBy: jest.fn(),
    count: jest.fn(),
    countBy: jest.fn(),
    query: jest.fn(),
    softDelete: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn((dto: DeepPartial<T>) => dto as T),
    insert: jest.fn(),
    upsert: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    
    // Query builder
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
      getRawMany: jest.fn(),
      getRawOne: jest.fn(),
      getCount: jest.fn(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
    })),

    // Minimal metadata
    metadata: {
      columns: [],
      relations: [],
      // Cast to bypass TypeScript checks for other metadata properties
    } as any,

    // Add manager property
    manager: {} as any,
    target: {} as any,
    queryRunner: undefined,

    // Cast the entire object to bypass TypeScript checks for missing properties
  } as unknown as jest.Mocked<Repository<T>>;

  return mock;
};

export type MockRepository<T extends ObjectLiteral> = jest.Mocked<Repository<T>>;