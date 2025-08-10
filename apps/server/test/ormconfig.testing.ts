import { getTestDbConfig } from './utils/config/test-db-config';
const ormConfig = getTestDbConfig();
export default ormConfig;

describe('ORM Config', () => {
  it('should export valid configuration', () => {
    expect(ormConfig).toBeDefined();
    expect(['sqlite', 'mysql']).toContain(ormConfig.type);
    expect(ormConfig.entities).toBeDefined();
    expect(ormConfig.entities?.length).toBeGreaterThan(0);
  });
});
