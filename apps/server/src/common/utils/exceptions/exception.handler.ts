import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorResponse } from './types/exception.types';
import { ConfigService } from '@nestjs/config';

export const ExceptionHandler = (exception: unknown, config: ConfigService) => {
  const timestamp = new Date().toISOString();
  const logger = new Logger();
  const nodeEnv = config.get<'development' | 'production'>('server.nodeEnv');

  logger.error(exception);

  let errorResponse: ErrorResponse = {
    timestamp,
    status: 500,
    success: false,
  };

  if (
    exception instanceof BadRequestException ||
    exception instanceof InternalServerErrorException ||
    exception instanceof NotFoundException ||
    exception instanceof UnauthorizedException
  ) {
    errorResponse = {
      ...errorResponse,
      status: exception.getStatus(),
      message: (exception as any).response.message || exception.message,
    };
  }

  if (nodeEnv !== 'production') {
    errorResponse.stack = (exception as any).stack;
    errorResponse._meta = (exception as any)?.getResponse?.()?._meta;
  }

  return errorResponse;
};
