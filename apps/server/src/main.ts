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
  const app = await NestFactory.create(AppModule);

  // Config
  const configService = app.get(ConfigService);
  const port = configService.get('server.port');
  const managementUrl = configService.getOrThrow('server.managementUrl')

  // Logging
  app.useLogger(app.get(Logger));
  const logger = new NestLogger();

  // TODO enable.
  // app.enableCors({ origin: new URL(managementUrl).origin });

  await new SetupService().performSetupTasks().catch(e => logger.error(e));

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
    }),
  );

  await app.listen(port, () => {
    logger.log(`Server listening on PORT - ${port}`);
  });
}

bootstrap();