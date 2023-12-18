import { Module } from '@nestjs/common';
import { APIService } from './apis.service';
import { APIController } from './apis.controller';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';

import { Collection } from '@common/database/entities/collection.entity';
import { CollectionRoute } from '@common/database/entities/collectionroute.entity';

@Module({
  controllers: [APIController],
  providers: [APIService, KongServiceService, KongRouteService],
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionRoute]),
    HttpModule,
  ],
})
export class APIModule {}
