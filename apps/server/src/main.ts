import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger as NestLogger,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SetupService } from './setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });

  // Config
  const configService = app.get(ConfigService);
  const port = configService.get('system.port');
  const corsOrigins = configService.get<string>('system.corsOrigins');

  // Logging
  app.useLogger(app.get(Logger));
  const logger = new NestLogger();

  // TODO
  if (corsOrigins) {
    // app.enableCors({ origin: corsOrigins.split(',') });
  }

  await new SetupService().performSetupTasks().catch((e) => logger.error(e));

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
    }),
  );

  await app.listen(port, () => {
    logger.log(`SERVER LISTENING ON PORT - ${port}`);
  });
}

bootstrap();
