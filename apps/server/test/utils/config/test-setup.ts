import { createMockRepository } from '../mocks/typeorm.mock';
import { mockHttpService } from '../mocks/http.mock';

jest.mock('@nestjs/axios', () => ({
  HttpService: mockHttpService
}));

jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getRepository: () => createMockRepository(),
  PrimaryGeneratedColumn: () => jest.fn(),
  Column: () => jest.fn(),
  Entity: () => jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));
});

afterEach(() => {
  jest.useRealTimers();
});