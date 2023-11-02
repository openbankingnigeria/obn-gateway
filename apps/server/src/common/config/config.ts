export const globalConfig = () => ({
  server: {
    port: parseInt(process.env.SERVER_PORT as string, 10) || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    type: process.env.DATABASE_TYPE || 'mysql',
    host: parseInt(process.env.DATABASE_HOST as string, 10) || 3306,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
});
