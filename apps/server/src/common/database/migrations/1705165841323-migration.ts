import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { IsNull, MigrationInterface, Not, QueryRunner } from 'typeorm';
import { APIService } from 'src/apis/apis.service';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { CreateAPIDto } from 'src/apis/dto/index.dto';
import { APIModule } from 'src/apis/apis.module';
import { RequestContext } from '@common/utils/request/request-context';
import axios from 'axios';
import { CollectionsModule } from 'src/collections/collections.module';
import { CollectionsService } from 'src/collections/collections.service';
import { CreateCollectionDto } from 'src/collections/dto/index.dto';
import slugify from 'slugify';

function processItem(
  item: any,
  parentKeys: string[] = [''],
  result: any = {},
  depth = 1,
) {
  const [parentKey, ...childrenKeys] = parentKeys;
  if (Array.isArray(item)) {
    item.forEach((subitem) =>
      processItem(
        subitem,
        parentKey
          ? [parentKey, ...childrenKeys, subitem.name]
          : [...childrenKeys, subitem.name],
        result,
      ),
    );
  } else if (item) {
    if (!result[parentKey]) {
      result[parentKey] = { description: item.description, data: [] };
    } else if (!item.item) {
      result[parentKey].data.push({
        name: childrenKeys.join('/'),
        description: item.description,
        request: item.request,
      });
    }
    if (item.item) {
      processItem(item.item, parentKeys, result, depth + 1);
    }
  }

  return result;
}

export class Migration1705165841323 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = await axios.get('https://apis.openbanking.ng/', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const data = await axios.get(
      `https://apis.openbanking.ng/api/collections/${schema.data.collection.info.collectionId}/${schema.data.collection.info.publishedId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    const folders = processItem(data.data.item);

    const app = await NestFactory.createApplicationContext(AppModule);
    const apiService = app.select(APIModule).get(APIService);
    const collectionService = app
      .select(CollectionsModule)
      .get(CollectionsService);

    // TODO get back to this, use central getUserByEmail implementation
    const user = await apiService.userRepository.findOne({
      where: {
        email: process.env.COMPANY_EMAIL,
        role: { parentId: Not(IsNull()) },
      },
      relations: {
        role: {
          permissions: true,
          parent: true,
        },
        company: true,
      },
    });

    const ctx = new RequestContext({ user: user! });

    for (const folder in folders) {
      try {
        let collection = await collectionService
          .viewCollection(ctx, slugify(folder))
          .catch(console.error);

        if (!collection) {
          collection = await collectionService.createCollection(
            ctx,
            new CreateCollectionDto({
              name: folder,
              description: folders[folder].description,
            }),
          );
        }

        for (const { name, request } of folders[folder].data) {
          await apiService.createAPI(
            ctx,
            KONG_ENVIRONMENT.DEVELOPMENT,
            new CreateAPIDto({
              collectionId: collection.data.id,
              name,
              enabled: false,
              url: request.url,
              route: {
                paths: ['/' + request.urlObject.path.join('/')],
                methods: [request.method],
              },
            }),
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    await app.close();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
