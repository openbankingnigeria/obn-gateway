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
export class SwaggerV2Parser implements IApiSpecParser {
  canParse(spec: any): boolean {
    return spec?.swagger && spec.swagger === '2.0';
  }

  validate(spec: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!spec.swagger) {
      errors.push('Missing required field: swagger');
    }
    if (!spec.info) {
      errors.push('Missing required field: info');
    }
    if (!spec.paths) {
      errors.push('Missing required field: paths');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getSpecInfo(spec: any): { format: string; version: string } {
    return {
      format: 'openapi_v2',
      version: spec.swagger || '2.0',
    };
  }

  parse(spec: any): ParsedApiSpec {
    const baseUrl = this.constructBaseUrl(spec);

    return {
      metadata: {
        title: spec.info?.title || 'Untitled API',
        description: spec.info?.description,
        version: spec.info?.version || '1.0.0',
        baseUrl,
      },
      endpoints: this.parseEndpoints(spec.paths || {}, spec.basePath || ''),
    };
  }

  private constructBaseUrl(spec: any): string {
    const scheme = spec.schemes?.[0] || 'https';
    const host = spec.host || '';
    const basePath = spec.basePath || '';

    if (!host) return basePath;
    return `${scheme}://${host}${basePath}`;
  }

  private parseEndpoints(paths: any, basePath: string): ParsedEndpoint[] {
    const endpoints: ParsedEndpoint[] = [];

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(methods as any)) {
        const op = operation as any;
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
          endpoints.push({
            name: op.operationId || op.summary || `${method} ${path}`,
            path,
            method: method.toUpperCase() as HTTP_METHODS,
            summary: op.summary,
            description: op.description,
            tags: op.tags,
            parameters: this.parseParameters(op.parameters),
            requestBody: this.parseRequestBody(op.parameters),
            responses: op.responses,
            security: op.security,
          });
        }
      }
    }

    return endpoints;
  }

  private parseParameters(parameters: any[]): ParsedParameter[] {
    if (!parameters || !Array.isArray(parameters)) return [];

    return parameters
      .filter((param) => param.in !== 'body')
      .map((param) => ({
        name: param.name,
        in: param.in,
        required: param.required || false,
        type: param.type || 'string',
        description: param.description,
        schema: param.schema,
      }));
  }

  private parseRequestBody(parameters: any[]): ParsedRequestBody | undefined {
    if (!parameters || !Array.isArray(parameters)) return undefined;

    const bodyParam = parameters.find((param) => param.in === 'body');
    if (!bodyParam) return undefined;

    return {
      required: bodyParam.required || false,
      content: { 'application/json': { schema: bodyParam.schema } },
      schema: bodyParam.schema,
    };
  }
}
