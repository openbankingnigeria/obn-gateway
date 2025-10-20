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
export class OpenApiV3Parser implements IApiSpecParser {
  canParse(spec: any): boolean {
    return spec?.openapi && spec.openapi.startsWith('3.');
  }

  validate(spec: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!spec.openapi) {
      errors.push('Missing required field: openapi');
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
      format: 'openapi_v3',
      version: spec.openapi || '3.0.0',
    };
  }

  parse(spec: any): ParsedApiSpec {
    return {
      metadata: {
        title: spec.info?.title || 'Untitled API',
        description: spec.info?.description,
        version: spec.info?.version || '1.0.0',
        servers: spec.servers || [],
        baseUrl: spec.servers?.[0]?.url,
      },
      endpoints: this.parseEndpoints(spec.paths || {}),
    };
  }

  private parseEndpoints(paths: any): ParsedEndpoint[] {
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
            requestBody: this.parseRequestBody(op.requestBody),
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

    return parameters.map((param) => ({
      name: param.name,
      in: param.in,
      required: param.required || false,
      type: param.schema?.type || 'string',
      description: param.description,
      schema: param.schema,
    }));
  }

  private parseRequestBody(requestBody: any): ParsedRequestBody | undefined {
    if (!requestBody) return undefined;

    return {
      required: requestBody.required || false,
      content: requestBody.content,
      schema: requestBody.content?.['application/json']?.schema,
    };
  }
}
