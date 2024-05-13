import { Injectable, Logger } from '@nestjs/common';
import {
  CreatePluginRequest,
  CreatePluginResponse,
  ListPluginsRequest,
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
    if (!data.tags) {
      data.tags = [data.name];
    } else {
      data.tags = Array.from(new Set([...data.tags, data.name]));
    }
    const response = await firstValueFrom(
      this.httpService
        .post<CreatePluginResponse>(
          `${this.config.get('kong.adminEndpoint')[environment]}/plugins`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to create API settings',
            });
          }),
        ),
    );
    return response.data;
  }

  async getPlugins(environment: KONG_ENVIRONMENT, params: ListPluginsRequest) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListPluginsResponse>(
          `${this.config.get('kong.adminEndpoint')[environment]}/plugins`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to fetch API settings',
            });
          }),
        ),
    );
    return response.data;
  }

  async updateOrCreatePlugin(
    environment: KONG_ENVIRONMENT,
    data: CreatePluginRequest,
  ) {
    if (!data.tags) {
      data.tags = [data.name];
    } else {
      data.tags = Array.from(new Set([...data.tags, data.name]));
    }
    const response = await firstValueFrom(
      this.httpService
        .put<CreatePluginResponse>(
          `${this.config.get('kong.adminEndpoint')[environment]}/plugins/${
            data.name
          }`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to update API settings',
            });
          }),
        ),
    );
    return response.data;
  }
}
