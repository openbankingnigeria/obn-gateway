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

@Injectable()
export class KongPluginService {
  private readonly logger = new Logger(KongPluginService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async createPlugin(data: CreatePluginRequest) {
    const response = await firstValueFrom(
      this.httpService
        .post<CreatePluginResponse>(
          `${this.config.get('kong.adminUrl')}/plugins`,
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

  async getPlugins() {
    const response = await firstValueFrom(
      this.httpService
        .get<ListPluginsResponse>(`${this.config.get('kong.adminUrl')}/plugins`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({});
          }),
        ),
    );
    return response.data;
  }

  async updateOrCreatePlugin(data: CreatePluginRequest) {
    const plugins = await this.getPlugins();
    const plugin = plugins.data.find((plugin) => plugin.name === data.name);
    if (!plugin) return this.createPlugin(data);
    const response = await firstValueFrom(
      this.httpService
        .put<CreatePluginResponse>(
          `${this.config.get('kong.adminUrl')}/plugins/${plugin.id}`,
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
