import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { KongServiceService } from '@shared/integrations/kong/service.kong.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from '@common/database/entities/collection.entity';
import { HttpModule } from '@nestjs/axios';
import { KongRouteService } from '@shared/integrations/kong/route.kong.service';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService, KongServiceService, KongRouteService],
  imports: [TypeOrmModule.forFeature([Collection]), HttpModule],
})
export class CollectionsModule {}
