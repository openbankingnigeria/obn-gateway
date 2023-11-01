import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export interface IError {
  message?: string;
  data?: any;
}

export class IUnauthorizedException extends UnauthorizedException {
  name = 'UNAUTHORIZED_EXCEPTION';
  constructor({ message, data }: IError) {
    super({ message, data });
  }
}

export class IBadRequestException extends BadRequestException {
  name = 'BAD_REQUEST_EXCEPTION';
  constructor({ message, data }: IError) {
    super({ message, data });
  }
}

export class IInternalServerErrorException extends InternalServerErrorException {
  name = 'INTERNAL_SERVER_ERROR_EXCEPTION';
  constructor({ message, data }: IError) {
    super({ message, data });
  }
}

export class INotFoundException extends NotFoundException {
  name = 'NOT_FOUND_EXCEPTION';
  constructor({ message, data }: IError) {
    super({ message, data });
  }
}
