export const globalConfig = () => ({
  server: {
    port: parseInt(process.env.SERVER_PORT as string, 10) || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    type: process.env.DATABASE_TYPE || 'mysql',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT as string, 10) || 3306,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  auth: {
    jwtExpires: process.env.JWT_EXPIRES || '15m',
    jwtSecret: process.env.JWT_SECRET,
  },
});
