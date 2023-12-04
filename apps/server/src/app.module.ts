import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, OnModuleInit } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validationSchema } from './common/config/validationSchema';
import { globalConfig } from './common/config/config';
import { GlobalExceptionFilter } from './common/utils/exceptions/exception.filter';
import { getDatabaseConfig } from './common/database/database.config';
import { AuthGuard } from './common/utils/authentication/auth.guard';
import { Auth } from './common/utils/authentication/auth.helper';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './common/database/entities';
import { RolesModule } from './roles/roles.module';
import { ProfileModule } from './profile/profile.module';
import { EmailService } from './shared/email/email.service';
import { AuditLogsModule } from './auditLogs/auditLogs.module';
import { CollectionsModule } from './collections/collections.module';
import { KongPluginService } from '@shared/integrations/kong/plugin/plugin.kong.service';
import { HttpModule } from '@nestjs/axios';
import { SettingsModule } from './settings/settings.module';
import { CompanyModule } from './company/company.module';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { path } from 'app-root-path';
import * as settingsKybJson from '@common/config/settings.kyb.json';

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
    EventEmitterModule.forRoot({ wildcard: true }),
    AuthModule,
    UsersModule,
    RolesModule,
    ProfileModule,
    AuditLogsModule,
    CollectionsModule,
    HttpModule,
    SettingsModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [
    JwtService,
    KongPluginService,
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
    EmailService,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    const settingsDirExists = existsSync(join(path, 'server.settings'));
    const settingsFileExists = existsSync(
      join(path, 'server.settings', 'settings.kyb.json'),
    );

    if (!settingsDirExists) {
      mkdirSync(join(path, 'server.settings'));
    }

    if (!settingsFileExists) {
      writeFileSync(
        join(path, 'server.settings', 'settings.kyb.json'),
        JSON.stringify(settingsKybJson),
      );
    }
  }
}
