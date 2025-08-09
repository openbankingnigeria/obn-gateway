# Testing Documentation

## Running Tests

### Before run test Commands
pnpm store prune                # Cleans unused packages from PNPM store
pnpm jest --clearCache          # Clears Jest test cache
rm -rf dist node_modules/.cache # Removes build artifacts and cached modules
rm -rf tsconfig.tsbuildinfo     # Clears TypeScript build info (prevents stale builds)
pnpm install                    # Fresh install of all dependencies
pnpm build                      # Rebuild the project
pnpm approve-builds sqlite3

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