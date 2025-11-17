import { Injectable } from '@nestjs/common';
import { HTTP_METHODS } from 'src/apis/types';
import {
  IApiSpecParser,
  ParsedApiSpec,
  ParsedEndpoint,
  ParsedParameter,
  ParsedRequestBody,
} from '../interfaces/parser.interface';

@Injectable()
export class PostmanV2Parser implements IApiSpecParser {
  canParse(spec: any): boolean {
    return (
      spec?.info?.schema?.includes('postman') ||
      spec?.info?.schema?.includes('collection')
    );
  }

  validate(spec: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!spec.info) {
      errors.push('Missing required field: info');
    }
    if (!spec.item) {
      errors.push('Missing required field: item');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getSpecInfo(spec: any): { format: string; version: string } {
    const schemaVersion =
      spec.info?.schema?.match(/v(\d+\.\d+\.\d+)/)?.[1] || '2.1.0';
    return {
      format: 'postman_v2',
      version: schemaVersion,
    };
  }

  parse(spec: any): ParsedApiSpec {
    return {
      metadata: {
        title: spec.info?.name || 'Untitled Collection',
        description: spec.info?.description,
        version: spec.info?.version || '1.0.0',
        baseUrl: this.extractBaseUrl(spec),
      },
      endpoints: this.parseItems(spec.item || []),
    };
  }

  private extractBaseUrl(spec: any): string {
    return spec.variable?.find((v: any) => v.key === 'baseUrl')?.value || '';
  }

  private parseItems(
    items: any[],
    parentFolder: string = '',
  ): ParsedEndpoint[] {
    const endpoints: ParsedEndpoint[] = [];

    for (const item of items) {
      if (item.item) {
        endpoints.push(...this.parseItems(item.item, item.name));
      } else if (item.request) {
        endpoints.push(this.parseRequest(item, parentFolder));
      }
    }

    return endpoints;
  }

  private parseRequest(item: any, folder: string): ParsedEndpoint {
    const request = item.request;
    const url =
      typeof request.url === 'string'
        ? request.url
        : this.constructUrl(request.url);

    return {
      name: item.name,
      path: this.extractPath(url),
      method: request.method as HTTP_METHODS,
      description: item.request?.description,
      tags: folder ? [folder] : [],
      parameters: this.parsePostmanParams(request),
      requestBody: this.parsePostmanBody(request.body),
      responses: this.parsePostmanResponses(item.response),
    };
  }

  private constructUrl(urlObj: any): string {
    if (typeof urlObj === 'string') return urlObj;

    const protocol = urlObj.protocol || 'https';
    const host = Array.isArray(urlObj.host)
      ? urlObj.host.join('.')
      : urlObj.host || '';
    const path = Array.isArray(urlObj.path)
      ? '/' + urlObj.path.join('/')
      : urlObj.path || '';

    return `${protocol}://${host}${path}`;
  }

  private extractPath(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  private parsePostmanParams(request: any): ParsedParameter[] {
    const params: ParsedParameter[] = [];

    if (request.url?.query) {
      const queryParams = Array.isArray(request.url.query)
        ? request.url.query
        : [];
      queryParams.forEach((param: any) => {
        params.push({
          name: param.key,
          in: 'query',
          required: !param.disabled,
          type: 'string',
          description: param.description,
        });
      });
    }

    if (request.header) {
      const headers = Array.isArray(request.header) ? request.header : [];
      headers.forEach((header: any) => {
        params.push({
          name: header.key,
          in: 'header',
          required: !header.disabled,
          type: 'string',
          description: header.description,
        });
      });
    }

    return params;
  }

  private parsePostmanBody(body: any): ParsedRequestBody | undefined {
    if (!body) return undefined;

    const content: any = {};

    if (body.mode === 'raw') {
      const contentType = body.options?.raw?.language || 'json';
      content[`application/${contentType}`] = {
        schema: body.raw,
      };
    } else if (body.mode === 'formdata') {
      content['multipart/form-data'] = {
        schema: body.formdata,
      };
    } else if (body.mode === 'urlencoded') {
      content['application/x-www-form-urlencoded'] = {
        schema: body.urlencoded,
      };
    }

    return {
      required: true,
      content,
    };
  }

  private parsePostmanResponses(responses: any[]): any {
    if (!responses || !Array.isArray(responses)) return {};

    const parsedResponses: any = {};

    responses.forEach((response: any) => {
      const code = response.code || response.status || '200';
      parsedResponses[code] = {
        description: response.name || `Response ${code}`,
        content: response.body
          ? {
              'application/json': {
                example: response.body,
              },
            }
          : undefined,
      };
    });

    return parsedResponses;
  }
}
