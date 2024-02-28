import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';
import {
  Collection,
  CollectionRoute,
  Company,
} from '@common/database/entities';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';

@Module({
  controllers: [CollectionsController],
  providers: [
    CollectionsService,
    KongServiceService,
    KongRouteService,
    KongConsumerService,
  ],
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionRoute, Company]),
    HttpModule,
  ],
})
export class CollectionsModule {}
