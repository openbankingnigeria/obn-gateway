import { PipeTransform, Injectable } from '@nestjs/common';

export interface PaginationParameters {
  page: number;
  limit: number;
}

@Injectable()
export class PaginationPipe
  implements PipeTransform<any, PaginationParameters>
{
  transform(query: any): PaginationParameters {
    let { limit, page } = query;

    limit = parseInt(limit, 10) || 20;
    page = parseInt(page, 10) || 1;

    page = page <= 0 ? 1 : page;
    limit = limit <= 0 ? 20 : limit;

    const result = {
      limit,
      page,
    };

    return result;
  }
}
