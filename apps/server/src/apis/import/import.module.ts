import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportedApiSpec } from '@common/database/entities/importedapispec.entity';
import { Collection } from '@common/database/entities/collection.entity';
import { CollectionRoute } from '@common/database/entities/collectionroute.entity';
import { ApiSpecImportService } from './import.service';
import { OpenApiV3Parser } from './parsers/openapi-v3.parser';
import { SwaggerV2Parser } from './parsers/swagger-v2.parser';
import { PostmanV2Parser } from './parsers/postman-v2.parser';
import { APIService } from '../apis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImportedApiSpec, Collection, CollectionRoute]),
  ],
  providers: [
    ApiSpecImportService,
    OpenApiV3Parser,
    SwaggerV2Parser,
    PostmanV2Parser,
  ],
  exports: [ApiSpecImportService],
})
export class ApiImportModule {}
