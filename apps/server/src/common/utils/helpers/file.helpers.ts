import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileHelpers {
  constructor(private readonly config: ConfigService) {}

  validateFileSize(files: Record<string, Express.Multer.File[]>) {
    const fileSizes: number[] = [];
    const maxFileSize = this.config.get('uploads.maxFileUploadSize') as number;

    Object.keys(files).forEach((fileKey) => {
      const fileArray = files[fileKey];
      fileArray.forEach((file) => {
        fileSizes.push(file.size);
      });
    });

    if (fileSizes.some((size) => size > maxFileSize)) {
      return { isValid: false, maxFileSize };
    }

    return { isValid: true, maxFileSize };
  }
}
