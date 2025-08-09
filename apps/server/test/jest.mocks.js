// Mock expensive operations
jest.mock('bcrypt', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => 
    Promise.resolve(hash === `hashed_${password}`)
  ),
}));