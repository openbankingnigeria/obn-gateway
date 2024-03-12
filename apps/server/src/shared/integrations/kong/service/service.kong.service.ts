import { Injectable, Logger } from '@nestjs/common';
import {
  CreateServiceRequest,
  CreateServiceResponse,
  GetServiceResponse,
  ListRoutesResponse,
  ListServicesRequest,
  ListServicesResponse,
} from './service.kong.interface';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { IInternalServerErrorException } from '@common/utils/exceptions/exceptions';
import { ConfigService } from '@nestjs/config';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';

@Injectable()
// ;-)
export class KongServiceService {
  private readonly logger = new Logger(KongServiceService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async listServices(
    environment: KONG_ENVIRONMENT,
    params: Partial<ListServicesRequest>,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListServicesResponse>(
          `${this.config.get('kong.adminEndpoint')[environment]}/services`,
          { params },
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

  async getService(environment: KONG_ENVIRONMENT, id: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<GetServiceResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/services/${id}`,
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

  async getServiceRoutes(environment: KONG_ENVIRONMENT, id: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListRoutesResponse>(
          `${
            this.config.get('kong.adminEndpoint')[environment]
          }/services/${id}/routes`,
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

  async updateOrCreateService(
    environment: KONG_ENVIRONMENT,
    data: Partial<CreateServiceRequest>,
  ) {
    const response = await firstValueFrom(
      this.httpService
        .put<CreateServiceResponse>(
          `${this.config.get('kong.adminEndpoint')[environment]}/services/${
            data.name
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
