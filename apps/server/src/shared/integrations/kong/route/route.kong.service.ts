import { Injectable, Logger } from '@nestjs/common';
import {
  CreatePluginRequest,
  CreatePluginResponse,
  CreateRouteRequest,
  CreateRouteResponse,
  ListPluginsRequest,
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

  async getRoute(environment: KONG_ENVIRONMENT, routeId: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<CreateRouteResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/routes/${routeId}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to fetch API details',
            });
          }),
        ),
    );
    return response.data;
  }

  async listRoutes(environment: KONG_ENVIRONMENT, params: ListRoutesRequest) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListRoutesResponse>(
          `${this.config.get('kong.adminEndpoint')[environment]}/routes`,
          {
            params,
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to fetch API details',
            });
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
          `${this.config.get('kong.adminEndpoint')[environment]}/routes`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to create API details',
            });
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
          `${this.config.get('kong.adminEndpoint')[environment]}/routes/${id}`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to update API details',
            });
          }),
        ),
    );
    return response.data;
  }

  async deleteRoute(environment: KONG_ENVIRONMENT, id: string) {
    const response = await firstValueFrom(
      this.httpService
        .delete<UpdateRouteResponse>(
          `${this.config.get('kong.adminEndpoint')[environment]}/routes/${id}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to delete API details',
            });
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
    if (!data.tags) {
      data.tags = [data.name];
    } else {
      data.tags = Array.from(new Set([...data.tags, data.name]));
    }
    const response = await firstValueFrom(
      this.httpService
        .post<CreatePluginResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/routes/${id}/plugins`,
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

  async getPlugins(
    environment: KONG_ENVIRONMENT,
    id: string,
    params?: ListPluginsRequest,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListPluginsResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/routes/${id}/plugins`,
          { params },
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
    id: string,
    data: CreatePluginRequest,
  ) {
    const plugins = await this.getPlugins(environment, id);

    const plugin = plugins.data.find(
      (plugin) => plugin.route?.id === id && plugin.name === data.name,
    );
    if (!plugin) return this.createPlugin(environment, id, data);
    if (!data.tags) {
      data.tags = [data.name];
    } else {
      data.tags = Array.from(new Set([...data.tags, data.name]));
    }
    const response = await firstValueFrom(
      this.httpService
        .put<CreatePluginResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/routes/${id}/plugins/${plugin.id}`,
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
