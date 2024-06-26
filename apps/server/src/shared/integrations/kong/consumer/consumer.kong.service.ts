import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { IInternalServerErrorException } from '@common/utils/exceptions/exceptions';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import {
  CreateConsumerKeyResponse,
  CreateConsumerRequest,
  CreateConsumerResponse,
  ListAclsResponse,
  ListConsumerKeysResponse,
  ListPluginsRequest,
  UpdateConsumerAclResponse,
} from './consumer.kong.interface';
import {
  CreatePluginRequest,
  CreatePluginResponse,
  ListPluginsResponse,
} from '../plugin/plugin.kong.interface';

@Injectable()
export class KongConsumerService {
  private readonly logger = new Logger(KongConsumerService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getConsumer(environment: KONG_ENVIRONMENT, consumerId: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<CreateConsumerResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/consumers/${consumerId}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to fetch consumer details',
            });
          }),
        ),
    );
    return response.data;
  }

  async updateOrCreateConsumer(
    environment: KONG_ENVIRONMENT,
    data: CreateConsumerRequest,
  ) {
    const consumer = await this.getConsumer(environment, data.custom_id).catch(
      console.error,
    );
    const response = await firstValueFrom(
      this.httpService
        .put<CreateConsumerResponse>(
          `${this.config.get('kong.adminEndpoint')[environment]}/consumers/${
            data.custom_id
          }`,
          { ...consumer, ...data },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to update consumer details',
            });
          }),
        ),
    );
    return response.data;
  }

  async getConsumerAcls(
    environment: KONG_ENVIRONMENT,
    consumerId: string,
    offset?: string,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListAclsResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/consumers/${consumerId}/acls`,
          { params: { offset } },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log({ error: error.response?.data });
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to fetch consumer permissions',
            });
          }),
        ),
    );
    return response.data;
  }

  async updateConsumerAcl(
    environment: KONG_ENVIRONMENT,
    {
      aclAllowedGroupName,
      consumerId,
    }: { aclAllowedGroupName: string; consumerId: string },
  ) {
    const response = await firstValueFrom(
      this.httpService
        .post<UpdateConsumerAclResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/consumers/${consumerId}/acls`,
          {
            group: aclAllowedGroupName,
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log({ error: error.response?.data });
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to update consumer permissions',
            });
          }),
        ),
    );
    return response.data;
  }

  async deleteConsumerAcl(
    environment: KONG_ENVIRONMENT,
    { aclId, consumerId }: { aclId: string; consumerId: string },
  ) {
    const response = await firstValueFrom(
      this.httpService
        .delete<any>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/consumers/${consumerId}/acls/${aclId}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log({ error: error.response?.data });
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to delete consumer permissions',
            });
          }),
        ),
    );
    return response.data;
  }

  async getConsumerKeys(environment: KONG_ENVIRONMENT, consumerId: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListConsumerKeysResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/consumers/${consumerId}/key-auth`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to fetch consumer keys',
            });
          }),
        ),
    );
    return response.data;
  }

  async createConsumerKey(environment: KONG_ENVIRONMENT, consumerId: string) {
    const response = await firstValueFrom(
      this.httpService
        .post<CreateConsumerKeyResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/consumers/${consumerId}/key-auth`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to create consumer keys',
            });
          }),
        ),
    );
    return response.data;
  }

  async deleteConsumerKey(
    environment: KONG_ENVIRONMENT,
    consumerId: string,
    keyId: string,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .delete<CreateConsumerKeyResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/consumers/${consumerId}/key-auth/${keyId}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to delete consumer keys',
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
          }/consumers/${id}/plugins`,
          { params },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to fetch consumer settings',
            });
          }),
        ),
    );
    return response.data;
  }

  async createPlugin(
    environment: KONG_ENVIRONMENT,
    consumerId: string,
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
          }/consumers/${consumerId}/plugins`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to fetch consumer API settings',
            });
          }),
        ),
    );
    return response.data;
  }

  async updateOrCreatePlugin(
    environment: KONG_ENVIRONMENT,
    consumerId: string,
    data: CreatePluginRequest,
  ) {
    const plugins = await this.getPlugins(environment, consumerId);
    const plugin = plugins.data.find(
      (plugin) =>
        plugin.consumer?.id === consumerId && plugin.name === data.name,
    );
    if (!plugin) return this.createPlugin(environment, consumerId, data);
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
          }/consumers/${consumerId}/plugins/${plugin.id}`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: 'Unable to update consumer API settings',
            });
          }),
        ),
    );
    return response.data;
  }
}
