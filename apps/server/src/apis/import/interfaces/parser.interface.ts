import { HTTP_METHODS } from 'src/apis/types';

export interface IApiSpecParser {
  canParse(spec: any): boolean;
  validate(spec: any): { valid: boolean; errors: string[] };
  parse(spec: any): ParsedApiSpec;
  getSpecInfo(spec: any): { format: string; version: string };
}

export interface ParsedApiSpec {
  metadata: {
    title: string;
    description?: string;
    version: string;
    baseUrl?: string;
    servers?: Array<{ url: string; description?: string }>;
  };
  endpoints: ParsedEndpoint[];
}

export interface ParsedEndpoint {
  name: string;
  path: string;
  method: HTTP_METHODS;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: ParsedParameter[];
  requestBody?: ParsedRequestBody;
  responses?: ParsedResponses;
  security?: any[];
}

export interface ParsedParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'body';
  required: boolean;
  type: string;
  description?: string;
  schema?: any;
}

export interface ParsedRequestBody {
  required: boolean;
  content: any;
  schema?: any;
}

export interface ParsedResponses {
  [statusCode: string]: {
    description: string;
    content?: any;
    schema?: any;
  };
}

export interface ParsedSpecResult {
  spec: any;
  parser: IApiSpecParser;
  parsed: ParsedApiSpec;
  specInfo: {
    format: string;
    version: string;
  };
}

export interface ImportEndpointsResult {
  successCount: number;
  failedCount: number;
  errors: any[];
}
