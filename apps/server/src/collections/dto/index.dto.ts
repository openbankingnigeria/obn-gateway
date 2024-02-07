import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Collection } from '@common/database/entities/collection.entity';
import { GetAPIResponseDTO } from 'src/apis/dto/index.dto';

export class CreateCollectionDto {
  constructor(collection: CreateCollectionDto) {
    Object.assign(this, collection);
  }

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class UpdateCollectionDto {
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class GetCollectionResponseDTO {
  constructor(partial: Partial<Collection>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @IsArray()
  apis: GetAPIResponseDTO[];
}
