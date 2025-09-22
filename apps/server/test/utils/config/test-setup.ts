import { mockHttpService } from '../mocks/http.mock';

jest.mock('@nestjs/axios', () => ({
  HttpService: mockHttpService
}));

// TypeORM mocking moved to unit-test-setup.ts 
// E2e tests need real TypeORM decorators to create entity metadata

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));
});

afterEach(() => {
  jest.useRealTimers();
});