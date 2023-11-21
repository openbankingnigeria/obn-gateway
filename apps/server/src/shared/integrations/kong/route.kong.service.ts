import { Injectable, Logger } from '@nestjs/common';
import {
  CreateRouteRequest,
  CreateRouteResponse,
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

@Injectable()
export class KongRouteService {
  private readonly logger = new Logger(KongRouteService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async listRoutes(params: ListRoutesRequest) {
    const response = await firstValueFrom(
      this.httpService
        .get<ListRoutesResponse>(`${this.config.get('kong.adminUrl')}/routes`, {
          params,
        })
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

  async createRoute(data: Partial<CreateRouteRequest>) {
    const response = await firstValueFrom(
      this.httpService
        .post<CreateRouteResponse>(
          `${this.config.get('kong.adminUrl')}/routes`,
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

  async updateRoute(id: string, data: Partial<UpdateRouteRequest>) {
    const response = await firstValueFrom(
      this.httpService
        .patch<UpdateRouteResponse>(
          `${this.config.get('kong.adminUrl')}/routes/${id}`,
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
