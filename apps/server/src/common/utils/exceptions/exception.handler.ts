import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorResponse } from './types/exception.types';
import { ConfigService } from '@nestjs/config';

// TODO error response data structure different from success'
export const ExceptionHandler = (exception: unknown, config: ConfigService) => {
  const logger = new Logger();

  logger.error(exception);

  let errorResponse: ErrorResponse = {
    status: 500,
  };

  if (
    exception instanceof BadRequestException ||
    exception instanceof InternalServerErrorException ||
    exception instanceof NotFoundException ||
    exception instanceof UnauthorizedException ||
    exception instanceof PreconditionFailedException ||
    exception instanceof ForbiddenException
  ) {
    const exceptionResponse = exception.getResponse() as {
      message: string;
      data: any;
    };
    errorResponse = {
      ...errorResponse,
      status: exception.getStatus(),
      message:
        exceptionResponse.message === 'Unexpected field'
          ? 'One or more file fields passed were invalid.'
          : exceptionResponse.message || exception.message,
      data: exceptionResponse.data,
    };
  }

  return errorResponse;
};
