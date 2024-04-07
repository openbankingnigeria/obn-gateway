import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger as NestLogger,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });

  // Config
  const configService = app.get(ConfigService);
  const port = configService.get('system.port');
  const trustedOrigins = configService.get<string>('system.trustedOrigins');
  const managementUrl = configService.get<string>('system.managementUrl');
  // Logging
  app.useLogger(app.get(Logger));
  const logger = new NestLogger();

  if (trustedOrigins) {
    app.enableCors({ origin: trustedOrigins.split(',') });
  } else if (managementUrl) {
    app.enableCors({ origin: new URL(managementUrl).origin });
  }

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
