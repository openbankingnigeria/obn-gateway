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
  ListConsumerKeysResponse,
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
            this.config.get('kong.endpoint')[environment]
          }/consumers/${consumerId}`,
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

  async updateOrCreateConsumer(
    environment: KONG_ENVIRONMENT,
    data: Partial<CreateConsumerRequest>,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .put<CreateConsumerResponse>(
          `${this.config.get('kong.endpoint')[environment]}/consumers/${
            data.custom_id || data.username
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
            this.config.get('kong.endpoint')[environment]
          }/consumers/${consumerId}/acls`,
          {
            group: aclAllowedGroupName,
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

  async deleteConsumerAcl(
    environment: KONG_ENVIRONMENT,
    { aclId, consumerId }: { aclId: string; consumerId: string },
  ) {
    const response = await firstValueFrom(
      this.httpService
        .delete<any>(
          `${
            this.config.get('kong.endpoint')[environment]
          }/consumers/${consumerId}/acls/${aclId}`,
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

  async getConsumerKeys(environment: KONG_ENVIRONMENT, consumerId: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListConsumerKeysResponse>(
          `${
            this.config.get('kong.endpoint')[environment]
          }/consumers/${consumerId}/key-auth`,
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

  async createConsumerKey(environment: KONG_ENVIRONMENT, consumerId: string) {
    const response = await firstValueFrom(
      this.httpService
        .post<CreateConsumerKeyResponse>(
          `${
            this.config.get('kong.endpoint')[environment]
          }/consumers/${consumerId}/key-auth`,
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

  async deleteConsumerKey(
    environment: KONG_ENVIRONMENT,
    consumerId: string,
    keyId: string,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .delete<CreateConsumerKeyResponse>(
          `${
            this.config.get('kong.endpoint')[environment]
          }/consumers/${consumerId}/key-auth/${keyId}`,
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
          }/consumers/${id}/plugins`,
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
    consumerId: string,
    data: CreatePluginRequest,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .post<CreatePluginResponse>(
          `${
            this.config.get('kong.endpoint')[environment]
          }/consumers/${consumerId}/plugins`,
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

  async updateOrCreatePlugin(
    environment: KONG_ENVIRONMENT,
    consumerId: string,
    data: CreatePluginRequest,
  ) {
    const plugins = await this.getPlugins(environment, consumerId);
    const plugin = plugins.data.find(
      (plugin) => plugin.consumer?.id === consumerId,
    );
    if (!plugin) return this.createPlugin(environment, consumerId, data);
    const response = await firstValueFrom(
      this.httpService
        .put<CreatePluginResponse>(
          `${
            this.config.get('kong.endpoint')[environment]
          }/consumers/${consumerId}/plugins/${plugin.id}`,
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
