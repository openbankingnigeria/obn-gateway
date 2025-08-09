import 'tsconfig-paths/register';

export default async () => {
  const dataSource = (global as any).__TEST_DB_CONNECTION__;
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
  }
};