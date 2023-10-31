export const globalConfig = () => ({
  server: {
    port: parseInt(process.env.SERVER_PORT as string, 10) || 8080,
  },
});
