import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validationSchema } from './common/config/validationSchema';
import { globalConfig } from './common/config/config';
import { GlobalExceptionFilter } from './common/utils/exceptions/exception.filter';
import { getDatabaseConfig } from './common/database/database.config';
import { AuthGuard } from './common/utils/authentication/auth.guard';
import { Auth } from './common/utils/authentication/auth.helper';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './common/database/entities';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [globalConfig],
    }),
    // Logging
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    // Database setup
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return getDatabaseConfig(config);
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    JwtService,
    Auth,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
