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
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Equal, IsNull, Not } from 'typeorm';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import { KongPluginService } from '@shared/integrations/kong/plugin/plugin.kong.service';
import { ConfigService } from '@nestjs/config';
import { CompanyTiers } from '@company/types';
import { INotFoundException } from '@common/utils/exceptions/exceptions';

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
        response: item.response,
      });
    }
    if (item.item) {
      processItem(item.item, parentKeys, result, depth + 1);
    }
  }

  return result;
}

function jsonToLua(jsonString: string) {
  const obj = JSON.parse(jsonString);

  function convertToLuaTable(obj: any, objKey = '', indentLevel = 0) {
    const dataType = Array.isArray(obj) ? 'array' : typeof obj;
    if (!['array', 'object'].includes(dataType) || obj === null) {
      let tableValue = `data${objKey}`;
      if (dataType === 'string') {
        tableValue = `tostring(${tableValue})`;
      }
      if (dataType === 'number') {
        tableValue = `tonumber(${tableValue})`;
      }
      return tableValue;
    }

    const indent = ' '.repeat(indentLevel * 4); // 4 spaces per indent level
    const innerIndent = ' '.repeat((indentLevel + 1) * 4);
    let luaTable = dataType === 'array' ? '{\n' : '{\n';

    if (dataType === 'array') {
      obj.splice(1);
    }

    for (let [key, value] of Object.entries(obj)) {
      if (dataType === 'array') {
        luaTable += `${innerIndent}-- Refer to lua's documentation on how to access and use array(table) data\n`;
        key = String(Number(key) + 1);
        value = value;
      } else if (!objKey) {
        objKey = '.';
      }
      const formattedKey =
        dataType === 'array' ? `` : `[${JSON.stringify(key)}] = `;
      const tableValue = convertToLuaTable(
        value,
        objKey +
          (dataType === 'array' ? `[${key}]` : !indentLevel ? key : `.${key}`),
        indentLevel + 1,
      );
      luaTable += `${innerIndent}${formattedKey}${tableValue},\n`;
    }

    luaTable += `${indent}}`;
    return luaTable;
  }

  return convertToLuaTable(obj, '');
}

async function performSetupTasks(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const apiService = app.select(APIModule).get(APIService);
  const collectionService = app
    .select(CollectionsModule)
    .get(CollectionsService);
  const kongPluginService = app.get(KongPluginService);
  const config = app.get(ConfigService);

  const schema = await axios.get('https://apis.openbanking.ng/', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 15_000,
  });
  const data = await axios.get(
    `https://apis.openbanking.ng/api/collections/${schema.data.collection.info.collectionId}/${schema.data.collection.info.publishedId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 15_000,
    },
  );

  const folders = processItem(data.data.item);

  for (const environment in config.get<Record<KONG_ENVIRONMENT, string>>(
    'kong.adminEndpoint',
  )) {
    const [user] = await Promise.all([
      apiService.userRepository.findOne({
        where: {
          email: Equal(process.env.DEFAULT_EMAIL!),
          role: { parentId: Not(IsNull()) },
        },
        relations: {
          role: {
            permissions: true,
            parent: { permissions: true },
          },
          company: true,
        },
      }),
      kongPluginService.updateOrCreatePlugin(environment as KONG_ENVIRONMENT, {
        name: KONG_PLUGINS.HTTP_LOG,
        enabled: true,
        config: {
          http_endpoint: config.get('logging.endpoint'),
          custom_fields_by_lua: {
            environment: `return '${environment}'`,
          },
        },
      }),
      kongPluginService.updateOrCreatePlugin(environment as KONG_ENVIRONMENT, {
        name: KONG_PLUGINS.KEY_AUTH,
        enabled: true,
        config: {
          key_names: ['x-api-key'],
          key_in_header: true,
          key_in_query: false,
          key_in_body: false,
          hide_credentials: true,
        },
      }),
      kongPluginService.updateOrCreatePlugin(environment as KONG_ENVIRONMENT, {
        name: KONG_PLUGINS.IP_RESTRICTION,
        enabled: true,
        config: {
          // disables API accesses globally, each consumer must set their IP whitelists
          deny: ['0.0.0.0/0'],
        },
      }),
      kongPluginService.updateOrCreatePlugin(environment as KONG_ENVIRONMENT, {
        name: KONG_PLUGINS.CORRELATION_ID,
        enabled: false,
        config: {
          header_name: 'X-Request-ID',
          echo_downstream: true,
          generator: 'uuid',
        },
      }),
    ]);

    const ctx = new RequestContext({ user: user! });

    for (const folder in folders) {
      try {
        let collection = await collectionService
          .viewCollection(ctx, slugify(folder))
          .catch((e) => {
            if (e instanceof INotFoundException) {
              return null;
            }
            throw e;
          });

        // get collection description, and remove html tags.
        const description = folders[folder].description
          ?.split('\n')?.[0]
          ?.replace(/(<([^>]+)>)/gi, '');
        if (!description) continue;

        if (!collection) {
          collection = await collectionService.createCollection(
            ctx,
            new CreateCollectionDto({
              name: folder,
              description,
            }),
          );
        }

        for (const { name, request, response } of folders[folder].data) {
          try {
            let api = await apiService
              .viewAPI(ctx, environment as KONG_ENVIRONMENT, name)
              .catch((e) => {
                if (e instanceof INotFoundException) {
                  return null;
                }
                throw e;
              });
            if (api) continue;

            const regexPath =
              '~' +
              request.urlObject.path.reduce((acc: string, curr: string) => {
                if (curr.startsWith(':')) {
                  curr = `(?P<${curr.slice(1)}>[^/]+)`;
                }
                return acc + '/' + curr;
              }, '') +
              '$';
            if (
              config.get('system.defaultDownstreamUrl') &&
              environment === KONG_ENVIRONMENT.DEVELOPMENT
            ) {
              const defaultDownstreamUrl = new URL(
                config.get('system.defaultDownstreamUrl')!,
              );
              const requestUrl = new URL(request.url);
              defaultDownstreamUrl.pathname += defaultDownstreamUrl.pathname =
                requestUrl.pathname.startsWith('/')
                  ? requestUrl.pathname.slice(1)
                  : requestUrl.pathname;
              defaultDownstreamUrl.search = requestUrl.search;
              request.url = defaultDownstreamUrl.toString();
            }
            api = await apiService.createAPI(
              ctx,
              environment as KONG_ENVIRONMENT,
              new CreateAPIDto({
                collectionId: collection.data!.id,
                name,
                enabled: false,
                introspectAuthorization:
                  collection.data!.slug !== 'authorization' &&
                  !!config.get('registry.introspectionEndpoint')[environment],
                upstream: {
                  url:
                    environment === KONG_ENVIRONMENT.DEVELOPMENT
                      ? request.url
                      : 'http://localhost',
                },
                downstream: {
                  path: regexPath,
                  method: request.method,
                  url: `${
                    config.get('kong.gatewayEndpoint')[environment] || ''
                  }/${request.urlObject.path.join('/')}`,
                  // TODO revisit and update host
                  request,
                  response,
                },
                tiers:
                  environment === 'development'
                    ? [
                        CompanyTiers.TIER_0,
                        CompanyTiers.TIER_1,
                        CompanyTiers.TIER_2,
                        CompanyTiers.TIER_3,
                      ]
                    : [CompanyTiers.TIER_3],
              }),
            );
            const transformationData = {
              upstream: `
local function transform_upstream_request()
  	local ok, err = pcall(function()
		-- Read the request body
		kong.service.request.enable_buffering()  -- Enable buffering to read body
		local data, err = kong.request.get_body()
		if err then
			kong.log.err(err)
			return
		end
			${
        (request.method !== 'GET' &&
          response?.[0]?.originalRequest?.body?.raw &&
          `-- Perform the transformation
					kong.ctx.shared.upstream_request = ${jsonToLua(
            response?.[0]?.originalRequest?.body?.raw,
          )}
		`) ||
        ''
      }
	end)
	if not ok then
		kong.log.err(err)
		return kong.response.error(500, "An unexpected error occurred")
	end
end
return transform_upstream_request`,
              downstream: `
local cjson = require 'cjson.safe'

local function transform_downstream_response()
  	local ok, err = pcall(function()
		${
      (response?.[0]?.body &&
        `
		if kong.service.response.get_status() == nil then
			return
		end
		local data = kong.service.response.get_body()
		data = cjson.decode(data)
		if kong.service.response.get_status() >= 400 then
			return
		end
		if data then
			kong.ctx.shared.downstream_response = ${jsonToLua(response?.[0]?.body)}
		end`) ||
      ''
    }
	end)
	if not ok then
		kong.log.err(err)
		return kong.response.error(500, "An unexpected error occurred")
	end
end
return transform_downstream_response`,
            };
            await apiService.setTransformation(
              ctx,
              environment as KONG_ENVIRONMENT,
              api.data!.id,
              transformationData,
            );
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  // TODO wait for pending events to finish before closing.
  await app.close();
}

(async () => {
  try {
    await performSetupTasks();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
