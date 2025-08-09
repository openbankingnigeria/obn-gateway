# Testing Documentation

## Running Tests

### Before run test Commands
cd apps/server
pnpm store prune
pnpm jest --clearCache
rm -rf dist node_modules/.cache
pnpm install
pnpm build
rm -rf tsconfig.tsbuildinfo

### Basic Commands
```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:cov

# Run specific test file
pnpm test src/module/file.spec.ts

# Runs with CI-friendly output
pnpm test:ci