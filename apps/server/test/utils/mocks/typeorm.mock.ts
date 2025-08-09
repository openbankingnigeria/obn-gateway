import { ObjectLiteral, DeepPartial, Repository } from 'typeorm';

export const createMockRepository = <T extends ObjectLiteral>() => ({
  save: jest.fn((entity: T) => Promise.resolve(entity)),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn((dto: DeepPartial<T>) => dto),
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
  metadata: {
    columns: [],
    relations: []
  }
});

export type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;