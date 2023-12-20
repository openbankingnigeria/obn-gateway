import { Module } from '@nestjs/common';
import { APIService } from './apis.service';
import { APIController } from './apis.controller';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';

import { Collection } from '@common/database/entities/collection.entity';
import { CollectionRoute } from '@common/database/entities/collectionroute.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestContextService } from '@common/utils/request/request-context.service';

@Module({
  controllers: [APIController],
  providers: [
    APIService,
    KongServiceService,
    KongRouteService,
    RequestContextService,
  ],
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionRoute]),
    HttpModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => config.get('elasticsearch')!,
      inject: [ConfigService],
    }),
  ],
})
export class APIModule {}
