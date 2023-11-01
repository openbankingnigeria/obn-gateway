import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig: (
  config: ConfigService,
) => TypeOrmModuleOptions = (config) => {
  const options = {
    type: config.get('database.type') as any,
    host: config.get('database.host') as string,
    port: config.get('database.port') as string,
    username: config.get('database.username') as string,
    password: config.get('database.password') as string,
    database: config.get('database.name') as string,
    entities: [],
    synchronize:
      config.get<'development' | 'production'>('server.nodeEnv') ===
      'development',
  };

  return options;
};
