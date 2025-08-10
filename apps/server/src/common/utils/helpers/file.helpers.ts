import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
import { Multer } from 'multer';

@Injectable()
export class FileHelpers {
  constructor(private readonly config: ConfigService) {}

  validateFile(files: Express.Multer.File[]) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const fileSizes: number[] = [];
    const maxFileSize = this.config.get('uploads.maxFileUploadSize') as number;

    files.forEach((file) => {
      fileSizes.push(file.size);
    });

    const response = {
      isSizeValid: true,
      isFileTypeValid: true,
      maxFileSize,
    };

    if (fileSizes.some((size) => size > maxFileSize)) {
      response.isSizeValid = false;
    }

    if (files.some((file) => !allowedMimeTypes.includes(file.mimetype))) {
      response.isFileTypeValid = false;
    }

    return response;
  }
}
