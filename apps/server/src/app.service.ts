import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import { KongPluginService } from '@shared/integrations/kong/plugin/plugin.kong.service';
import * as moment from 'moment';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly kongPluginService: KongPluginService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    for (const environment in this.config.get<Record<KONG_ENVIRONMENT, string>>(
      'kong.endpoint',
    )) {
      await this.kongPluginService
        .updateOrCreatePlugin(environment as KONG_ENVIRONMENT, {
          name: KONG_PLUGINS.HTTP_LOG,
          enabled: true,
          config: {
            http_endpoint: this.config.get('logging.endpoint'),
            custom_fields_by_lua: {
              environment: `return '${environment}'`,
            },
          },
        })
        .catch(console.error);

      await this.kongPluginService
        .updateOrCreatePlugin(environment as KONG_ENVIRONMENT, {
          name: KONG_PLUGINS.KEY_AUTH,
          enabled: true,
          config: {
            key_names: ['x-api-key'],
            key_in_header: true,
            key_in_query: false,
            key_in_body: false,
            hide_credentials: true,
          },
        })
        .catch(console.error);

      await this.kongPluginService
        .updateOrCreatePlugin(environment as KONG_ENVIRONMENT, {
          name: KONG_PLUGINS.IP_RESTRICTION,
          enabled: true,
          config: {
            // disables API accesses globally, each consumer must set their IP whitelists
            deny: ['0.0.0.0/0'],
          },
        })
        .catch(console.error);

      await this.kongPluginService
        .updateOrCreatePlugin(environment as KONG_ENVIRONMENT, {
          name: KONG_PLUGINS.CORRELATION_ID,
          enabled: true,
          config: {
            header_name: 'Request-ID',
            echo_downstream: true,
            generator: 'uuid',
          },
        })
        .catch(console.error);
    }
  }

  health() {
    return {
      status: 'active',
      timestamp: moment().toISOString(),
    };
  }
}
