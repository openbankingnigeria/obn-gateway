import { Injectable, Logger } from '@nestjs/common';
import {
  CreatePluginRequest,
  CreatePluginResponse,
  ListPluginsResponse,
} from './plugin.kong.interface';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { IInternalServerErrorException } from '@common/utils/exceptions/exceptions';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';

@Injectable()
export class KongPluginService {
  private readonly logger = new Logger(KongPluginService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async createPlugin(environment: KONG_ENVIRONMENT, data: CreatePluginRequest) {
    const response = await firstValueFrom(
      this.httpService
        .post<CreatePluginResponse>(
          `${this.config.get('kong.endpoint')[environment]}/plugins`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({});
          }),
        ),
    );
    return response.data;
  }

  async getPlugins(environment: KONG_ENVIRONMENT) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListPluginsResponse>(
          `${this.config.get('kong.endpoint')[environment]}/plugins`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({});
          }),
        ),
    );
    return response.data;
  }

  async updateOrCreatePlugin(
    environment: KONG_ENVIRONMENT,
    data: CreatePluginRequest,
  ) {
    const plugins = await this.getPlugins(environment);
    const plugin = plugins.data.find(
      (plugin) =>
        plugin.name === data.name &&
        plugin.route === null &&
        plugin.service === null &&
        plugin.consumer === null,
    );
    if (!plugin) return this.createPlugin(environment, data);
    const response = await firstValueFrom(
      this.httpService
        .put<CreatePluginResponse>(
          `${this.config.get('kong.endpoint')[environment]}/plugins/${
            plugin.id
          }`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({});
          }),
        ),
    );
    return response.data;
  }
}
