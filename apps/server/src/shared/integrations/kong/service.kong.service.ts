import { Injectable, Logger } from '@nestjs/common';
import {
  CreateServiceRequest,
  CreateServiceResponse,
  GetServiceResponse,
  ListServicesRequest,
  ListServicesResponse,
  UpdateServiceRequest,
  UpdateServiceResponse,
} from './service.kong.interface';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { IInternalServerErrorException } from 'src/common/utils/exceptions/exceptions';
import { ConfigService } from '@nestjs/config';
import { ListRoutesResponse } from './route.kong.interface';

@Injectable()
// ;-)
export class KongServiceService {
  private readonly logger = new Logger(KongServiceService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async listServices(params: Partial<ListServicesRequest>) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListServicesResponse>(
          `${this.config.get('kong.adminUrl')}/services`,
          { params },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: '',
            });
          }),
        ),
    );
    return response.data;
  }

  async getService(id: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<GetServiceResponse>(
          `${this.config.get('kong.adminUrl')}/services/${id}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: '',
            });
          }),
        ),
    );
    return response.data;
  }

  async getServiceRoutes(id: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListRoutesResponse>(
          `${this.config.get('kong.adminUrl')}/services/${id}/routes`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: '',
            });
          }),
        ),
    );
    return response.data;
  }

  async updateService(id: string, data: Partial<UpdateServiceRequest>) {
    const response = await firstValueFrom(
      this.httpService
        .patch<UpdateServiceResponse>(
          `${this.config.get('kong.adminUrl')}/services/${id}`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: '',
            });
          }),
        ),
    );
    return response.data;
  }

  async createService(data: Partial<CreateServiceRequest>) {
    const response = await firstValueFrom(
      this.httpService
        .post<CreateServiceResponse>(
          `${this.config.get('kong.adminUrl')}/services`,
          data,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error);
            throw new IInternalServerErrorException({
              message: '',
            });
          }),
        ),
    );
    return response.data;
  }
}
