import { DataSource, DataSourceOptions } from 'typeorm';
import { globalConfig } from '../config/config';

const datasource = new DataSource({
  ...globalConfig().database,
  database: globalConfig().database.name,
  entities: [__dirname + '/entities/*{.ts,.js}'],
  subscribers: [],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
} as DataSourceOptions);

export default datasource;
