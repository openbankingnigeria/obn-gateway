# Testing Documentation

## Running Tests

### Pre-Test Commands
```bash
pnpm store prune                                # Cleans unused packages from PNPM store
pnpm jest --clearCache                          # Clears Jest test cache
rm -rf dist node_modules/.cache .tscache        # Removes build artifacts and cached modules
rm -rf tsconfig.tsbuildinfo                     # Clears TypeScript build info (prevents stale builds)
pnpm install                                    # Fresh install of all dependencies
pnpm build                                      # Rebuild the project
docker compose --profile test up -d test-mysql  # For running end to end test
```

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