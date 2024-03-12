import { Module } from '@nestjs/common';
import { APIService } from './apis.service';
import { APIController } from './apis.controller';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';

import {
  Collection,
  CollectionRoute,
  Company,
  User,
} from '@common/database/entities';

import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';

@Module({
  controllers: [APIController],
  providers: [
    APIService,
    KongServiceService,
    KongConsumerService,
    KongRouteService,
  ],
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionRoute, Company, User]),
    HttpModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => config.get('elasticsearch')!,
      inject: [ConfigService],
    }),
  ],
})
export class APIModule {}
