import { createMockRepository } from '../mocks/typeorm.mock';

// Mock TypeORM decorators for unit tests only
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getRepository: () => createMockRepository(),
  PrimaryGeneratedColumn: () => jest.fn(),
  Column: () => jest.fn(),
  Entity: () => jest.fn()
}));