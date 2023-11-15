import { NestFactory } from '@nestjs/core';
import { Logger as NestLogger } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // TODO propery configure cors
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });

  // Config
  const configService = app.get(ConfigService);
  const port = configService.get('server.port');

  // Logging
  app.useLogger(app.get(Logger));
  const logger = new NestLogger();

  await app.listen(port, () => {
    logger.log(`Server listening on PORT - ${port}`);
  });
}
bootstrap();
