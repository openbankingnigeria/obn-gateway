import { Injectable, Logger } from '@nestjs/common';
import {
  CreatePluginRequest,
  CreatePluginResponse,
  CreateRouteRequest,
  CreateRouteResponse,
  ListPluginsResponse,
  ListRoutesRequest,
  ListRoutesResponse,
  UpdateRouteRequest,
  UpdateRouteResponse,
} from './route.kong.interface';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { IInternalServerErrorException } from '@common/utils/exceptions/exceptions';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';

@Injectable()
export class KongRouteService {
  private readonly logger = new Logger(KongRouteService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async listRoutes(environment: KONG_ENVIRONMENT, params: ListRoutesRequest) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListRoutesResponse>(
          `${this.config.get('kong.endpoint')[environment]}/routes`,
          {
            params,
          },
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

  async createRoute(
    environment: KONG_ENVIRONMENT,
    data: Partial<CreateRouteRequest>,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .post<CreateRouteResponse>(
          `${this.config.get('kong.endpoint')[environment]}/routes`,
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

  async updateRoute(
    environment: KONG_ENVIRONMENT,
    id: string,
    data: Partial<UpdateRouteRequest>,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .patch<UpdateRouteResponse>(
          `${this.config.get('kong.endpoint')[environment]}/routes/${id}`,
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

  async deleteRoute(environment: KONG_ENVIRONMENT, id: string) {
    const response = await firstValueFrom(
      this.httpService
        .delete<UpdateRouteResponse>(
          `${this.config.get('kong.endpoint')[environment]}/routes/${id}`,
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

  async createPlugin(
    environment: KONG_ENVIRONMENT,
    id: string,
    data: CreatePluginRequest,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .post<CreatePluginResponse>(
          `${
            this.config.get('kong.endpoint')[environment]
          }/routes/${id}/plugins`,
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

  async getPlugins(environment: KONG_ENVIRONMENT, id: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListPluginsResponse>(
          `${
            this.config.get('kong.endpoint')[environment]
          }/routes/${id}/plugins`,
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
    id: string,
    data: CreatePluginRequest,
  ) {
    const plugins = await this.getPlugins(environment, id);
    const plugin = plugins.data.find((plugin) => plugin.route?.id === id);
    if (!plugin) return this.createPlugin(environment, id, data);
    const response = await firstValueFrom(
      this.httpService
        .put<CreatePluginResponse>(
          `${
            this.config.get('kong.endpoint')[environment]
          }/routes/${id}/plugins/${plugin.id}`,
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