import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileHelpers {
  constructor(private readonly config: ConfigService) {}

  validateFileSize(files: Express.Multer.File[]) {
    const fileSizes: number[] = [];
    const maxFileSize = this.config.get('uploads.maxFileUploadSize') as number;

    files.forEach((file) => {
      fileSizes.push(file.size);
    });

    if (fileSizes.some((size) => size > maxFileSize)) {
      return { isValid: false, maxFileSize };
    }

    return { isValid: true, maxFileSize };
  }
}
