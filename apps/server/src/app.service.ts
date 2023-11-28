import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import { KongPluginService } from '@shared/integrations/kong/plugin/plugin.kong.service';
import * as moment from 'moment';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly kongPluginService: KongPluginService,
    private readonly config: ConfigService,
  ) {}

  onApplicationBootstrap() {
    this.kongPluginService.updateOrCreatePlugin({
      name: KONG_PLUGINS.HTTP_LOG,
      enabled: true,
      config: { http_endpoint: this.config.get('logging.endpoint') },
    });
  }

  health() {
    return {
      status: 'active',
      timestamp: moment().toISOString(),
    };
  }
}
