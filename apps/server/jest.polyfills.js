// Polyfills for Node.js 18+ (required for Jest)
const { TextEncoder, TextDecoder } = require('node:util');
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');
const { Blob, File } = require('node:buffer');
const { fetch, Headers, Request, Response, FormData } = require('undici');

// Set globals
Object.assign(global, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  WritableStream,
  TransformStream,
  Blob,
  File,
  fetch,
  Headers,
  Request,
  Response,
  FormData,
});

// Environment variables
process.env.NODE_ENV = 'test';
process.env.API_BASE_URL = 'http://test-api.example.com';
process.env.TZ = 'Africa/Lagos'; // Ensure consistent timezone for tests

// Mock Date to a fixed value in CI for deterministic tests
if (process.env.CI) {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');
  jest.useFakeTimers({
    now: mockDate,
    advanceTimers: true,
    doNotFake: [
      'nextTick',
      'setImmediate',
      'clearImmediate',
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
    ],
  });
}

// Increase Jest timeout for debug mode
if (process.env.DEBUG) {
  jest.setTimeout(60000);
}