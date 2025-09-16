import { IInternalServerErrorException } from '@common/utils/exceptions/exceptions';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { AxiosError, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import {
  CreatePluginRequest,
  CreatePluginResponse,
  KONG_PLUGINS,
  ListPluginsResponse,
  Plugin,
} from '../plugin/plugin.kong.interface';
import {
  Acl,
  ConsumerKey,
  CreateConsumerKeyResponse,
  CreateConsumerRequest,
  CreateConsumerResponse,
  ListAclsResponse,
  ListConsumerKeysResponse,
  UpdateConsumerAclResponse,
} from './consumer.kong.interface';
import { KongConsumerService } from './consumer.kong.service';

// Mock console methods to prevent test pollution
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('KongConsumerService', () => {
  let service: KongConsumerService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  // Test data
  const mockEnvironment = KONG_ENVIRONMENT.DEVELOPMENT;
  const mockConsumerId = 'test-consumer-id';
  const mockKongEndpoints = {
    [KONG_ENVIRONMENT.DEVELOPMENT]: 'http://localhost:8001',
    [KONG_ENVIRONMENT.PRODUCTION]: 'http://prod-kong:8001',
  };

  const mockConsumer: CreateConsumerResponse = {
    id: 'consumer-123',
    custom_id: 'custom-123',
    username: 'test-user',
    tags: ['tag1', 'tag2'],
    created_at: 1234567890,
  };

  const mockAcl: Acl = {
    id: 'acl-123',
    group: 'test-group',
    created_at: 1234567890,
    consumer: { id: 'consumer-123' },
  };

  const mockConsumerKey: ConsumerKey = {
    id: 'key-123',
    key: 'test-api-key',
    created_at: 1234567890,
    tags: ['test'],
    ttl: null,
    consumer: { id: 'consumer-123' },
  };

  const mockPlugin: Plugin = {
    id: 'plugin-123',
    name: KONG_PLUGINS.KEY_AUTH,
    created_at: 1234567890,
    updated_at: 1234567890,
    instance_name: 'test-plugin',
    config: { key_names: ['apikey'] },
    protocols: ['http', 'https'],
    enabled: true,
    tags: ['test'],
    route: null,
    consumer: { id: 'consumer-123' },
    service: null,
  };

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'kong.adminEndpoint') return mockKongEndpoints;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: KongConsumerService,
          useFactory: (http: HttpService, config: ConfigService) =>
            new KongConsumerService(http, config),
          inject: [HttpService, ConfigService],
        },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<KongConsumerService>(KongConsumerService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);

    // Override the logger to prevent console logs in tests
    (service as any).logger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConsumer', () => {
    it('should successfully get consumer details', async () => {
      const mockResponse: AxiosResponse<CreateConsumerResponse> = {
        data: mockConsumer,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getConsumer(mockEnvironment, mockConsumerId);

      expect(result).toEqual(mockConsumer);
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}`,
      );
    });

    it('should throw IInternalServerErrorException when HTTP request fails', async () => {
      const axiosError = {
        response: {
          data: { message: 'Consumer not found' },
          status: 404,
        },
        isAxiosError: true,
      } as AxiosError;

      httpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(
        service.getConsumer(mockEnvironment, mockConsumerId),
      ).rejects.toThrow(IInternalServerErrorException);
    });
  });

  describe('updateOrCreateConsumer', () => {
    const createConsumerRequest: CreateConsumerRequest = {
      custom_id: 'custom-123',
      username: 'test-user',
      tags: ['new-tag'],
    };

    describe('when consumer exists', () => {
      it('should update existing consumer successfully', async () => {
        const existingConsumer = { ...mockConsumer };
        const updatedConsumer = {
          ...existingConsumer,
          ...createConsumerRequest,
        };

        // Mock getConsumer to return existing consumer
        jest.spyOn(service, 'getConsumer').mockResolvedValue(existingConsumer);

        const mockResponse: AxiosResponse<CreateConsumerResponse> = {
          data: updatedConsumer,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.put.mockReturnValue(of(mockResponse));

        const result = await service.updateOrCreateConsumer(
          mockEnvironment,
          createConsumerRequest,
        );

        expect(result).toEqual(updatedConsumer);
        expect(service.getConsumer).toHaveBeenCalledWith(
          mockEnvironment,
          createConsumerRequest.custom_id,
        );
        expect(httpService.put).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${createConsumerRequest.custom_id}`,
          { ...existingConsumer, ...createConsumerRequest },
        );
      });

      it('should merge existing consumer data with new data', async () => {
        const existingConsumer = {
          ...mockConsumer,
          tags: ['existing-tag'],
          username: 'existing-user',
        };
        const mergedConsumer = {
          ...existingConsumer,
          ...createConsumerRequest,
        };

        jest.spyOn(service, 'getConsumer').mockResolvedValue(existingConsumer);

        const mockResponse: AxiosResponse<CreateConsumerResponse> = {
          data: mergedConsumer,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.put.mockReturnValue(of(mockResponse));

        const result = await service.updateOrCreateConsumer(
          mockEnvironment,
          createConsumerRequest,
        );

        expect(result).toEqual(mergedConsumer);
        expect(httpService.put).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${createConsumerRequest.custom_id}`,
          mergedConsumer,
        );
      });
    });

    describe('when consumer does not exist', () => {
      it('should create new consumer successfully', async () => {
        // Mock getConsumer to reject (consumer doesn't exist)
        jest
          .spyOn(service, 'getConsumer')
          .mockRejectedValue(new Error('Consumer not found'));
        jest.spyOn(console, 'error').mockImplementation(() => {});

        const mockResponse: AxiosResponse<CreateConsumerResponse> = {
          data: { ...mockConsumer, ...createConsumerRequest },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.put.mockReturnValue(of(mockResponse));

        const result = await service.updateOrCreateConsumer(
          mockEnvironment,
          createConsumerRequest,
        );

        expect(result).toEqual({ ...mockConsumer, ...createConsumerRequest });
        expect(service.getConsumer).toHaveBeenCalledWith(
          mockEnvironment,
          createConsumerRequest.custom_id,
        );
        expect(httpService.put).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${createConsumerRequest.custom_id}`,
          createConsumerRequest,
        );
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe('when update/create fails', () => {
      it('should throw IInternalServerErrorException when HTTP request fails', async () => {
        jest.spyOn(service, 'getConsumer').mockResolvedValue(mockConsumer);

        const axiosError = {
          response: {
            data: { message: 'Update failed' },
            status: 500,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.put.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.updateOrCreateConsumer(
            mockEnvironment,
            createConsumerRequest,
          ),
        ).rejects.toThrow(IInternalServerErrorException);

        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'Update failed',
        });
      });
    });
  });

  describe('getConsumerAcls', () => {
    describe('when ACLs exist', () => {
      it('should return consumer ACLs without offset', async () => {
        const mockAclsResponse = {
          data: [mockAcl],
          next: undefined,
        } as ListAclsResponse;

        const mockResponse: AxiosResponse<ListAclsResponse> = {
          data: mockAclsResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.get.mockReturnValue(of(mockResponse));

        const result = await service.getConsumerAcls(
          mockEnvironment,
          mockConsumerId,
        );

        expect(result).toEqual(mockAclsResponse);
        expect(httpService.get).toHaveBeenCalledTimes(1);
        expect(httpService.get).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/acls`,
          { params: { offset: undefined } },
        );
      });

      it('should return consumer ACLs with offset parameter', async () => {
        const mockOffset = 'next-offset-123';
        const mockAclsResponse: ListAclsResponse = {
          data: [mockAcl],
          next: 'another-offset-456',
          offset: mockOffset,
        };

        const mockResponse: AxiosResponse<ListAclsResponse> = {
          data: mockAclsResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.get.mockReturnValue(of(mockResponse));

        const result = await service.getConsumerAcls(
          mockEnvironment,
          mockConsumerId,
          mockOffset,
        );

        expect(result).toEqual(mockAclsResponse);
        expect(httpService.get).toHaveBeenCalledTimes(1);
        expect(httpService.get).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/acls`,
          { params: { offset: mockOffset } },
        );
      });
    });

    describe('when request fails', () => {
      it('should throw IInternalServerErrorException when HTTP request fails', async () => {
        const axiosError = {
          response: {
            data: { message: 'ACLs not found' },
            status: 404,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.get.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.getConsumerAcls(mockEnvironment, mockConsumerId),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(httpService.get).toHaveBeenCalledTimes(1);
      });

      it('should log error details to console', async () => {
        const consoleLogSpy = jest
          .spyOn(console, 'log')
          .mockImplementation(() => {});
        const axiosError = {
          response: {
            data: { message: 'ACLs fetch error' },
            status: 500,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.get.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.getConsumerAcls(mockEnvironment, mockConsumerId),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(consoleLogSpy).toHaveBeenCalledWith({
          error: { message: 'ACLs fetch error' },
        });
        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'ACLs fetch error',
        });

        consoleLogSpy.mockRestore();
      });
    });
  });

  describe('updateConsumerAcl', () => {
    const mockAclGroupName = 'test-acl-group';

    describe('when ACL update succeeds', () => {
      it('should add ACL permission to consumer successfully', async () => {
        const mockAclResponse = {
          ...mockAcl,
          group: mockAclGroupName,
        } as UpdateConsumerAclResponse;

        const mockResponse: AxiosResponse<UpdateConsumerAclResponse> = {
          data: mockAclResponse,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        };

        httpService.post.mockReturnValue(of(mockResponse));

        const result = await service.updateConsumerAcl(mockEnvironment, {
          aclAllowedGroupName: mockAclGroupName,
          consumerId: mockConsumerId,
        });

        expect(result).toEqual(mockAclResponse);
        expect(httpService.post).toHaveBeenCalledTimes(1);
        expect(httpService.post).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/acls`,
          { group: mockAclGroupName },
        );
      });
    });

    describe('when ACL update fails', () => {
      it('should throw IInternalServerErrorException when HTTP request fails', async () => {
        const axiosError = {
          response: {
            data: { message: 'ACL update failed' },
            status: 400,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.post.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.updateConsumerAcl(mockEnvironment, {
            aclAllowedGroupName: mockAclGroupName,
            consumerId: mockConsumerId,
          }),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(httpService.post).toHaveBeenCalledTimes(1);
      });

      it('should log error details to console', async () => {
        const consoleLogSpy = jest
          .spyOn(console, 'log')
          .mockImplementation(() => {});
        const axiosError = {
          response: {
            data: { message: 'ACL update error' },
            status: 500,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.post.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.updateConsumerAcl(mockEnvironment, {
            aclAllowedGroupName: mockAclGroupName,
            consumerId: mockConsumerId,
          }),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(consoleLogSpy).toHaveBeenCalledWith({
          error: { message: 'ACL update error' },
        });
        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'ACL update error',
        });

        consoleLogSpy.mockRestore();
      });
    });
  });

  describe('deleteConsumerAcl', () => {
    const mockAclId = 'acl-id-123';

    describe('when ACL deletion succeeds', () => {
      it('should delete ACL permission from consumer successfully', async () => {
        const mockDeleteResponse = {};

        const mockResponse: AxiosResponse<any> = {
          data: mockDeleteResponse,
          status: 204,
          statusText: 'No Content',
          headers: {},
          config: {} as any,
        };

        httpService.delete.mockReturnValue(of(mockResponse));

        const result = await service.deleteConsumerAcl(mockEnvironment, {
          aclId: mockAclId,
          consumerId: mockConsumerId,
        });

        expect(result).toEqual(mockDeleteResponse);
        expect(httpService.delete).toHaveBeenCalledTimes(1);
        expect(httpService.delete).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/acls/${mockAclId}`,
        );
      });
    });

    describe('when ACL deletion fails', () => {
      it('should throw IInternalServerErrorException when HTTP request fails', async () => {
        const axiosError = {
          response: {
            data: { message: 'ACL not found' },
            status: 404,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.delete.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.deleteConsumerAcl(mockEnvironment, {
            aclId: mockAclId,
            consumerId: mockConsumerId,
          }),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(httpService.delete).toHaveBeenCalledTimes(1);
      });

      it('should log error details to console', async () => {
        const consoleLogSpy = jest
          .spyOn(console, 'log')
          .mockImplementation(() => {});
        const axiosError = {
          response: {
            data: { message: 'ACL deletion error' },
            status: 500,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.delete.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.deleteConsumerAcl(mockEnvironment, {
            aclId: mockAclId,
            consumerId: mockConsumerId,
          }),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(consoleLogSpy).toHaveBeenCalledWith({
          error: { message: 'ACL deletion error' },
        });
        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'ACL deletion error',
        });

        consoleLogSpy.mockRestore();
      });
    });
  });

  describe('getConsumerKeys', () => {
    describe('when keys exist', () => {
      it('should return consumer API keys successfully', async () => {
        const mockKeysResponse = {
          data: [mockConsumerKey],
          next: undefined,
        } as ListConsumerKeysResponse;

        const mockResponse: AxiosResponse<ListConsumerKeysResponse> = {
          data: mockKeysResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.get.mockReturnValue(of(mockResponse));

        const result = await service.getConsumerKeys(
          mockEnvironment,
          mockConsumerId,
        );

        expect(result).toEqual(mockKeysResponse);
        expect(httpService.get).toHaveBeenCalledTimes(1);
        expect(httpService.get).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/key-auth`,
        );
      });
    });

    describe('when request fails', () => {
      it('should throw IInternalServerErrorException when HTTP request fails', async () => {
        const axiosError = {
          response: {
            data: { message: 'Consumer keys not found' },
            status: 404,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.get.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.getConsumerKeys(mockEnvironment, mockConsumerId),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(httpService.get).toHaveBeenCalledTimes(1);
        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'Consumer keys not found',
        });
      });
    });
  });

  describe('createConsumerKey', () => {
    describe('when key creation succeeds', () => {
      it('should create new API key for consumer successfully', async () => {
        const mockKeyResponse: CreateConsumerKeyResponse = {
          ...mockConsumerKey,
          key: 'new-generated-api-key',
        };

        const mockResponse: AxiosResponse<CreateConsumerKeyResponse> = {
          data: mockKeyResponse,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        };

        httpService.post.mockReturnValue(of(mockResponse));

        const result = await service.createConsumerKey(
          mockEnvironment,
          mockConsumerId,
        );

        expect(result).toEqual(mockKeyResponse);
        expect(httpService.post).toHaveBeenCalledTimes(1);
        expect(httpService.post).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/key-auth`,
        );
      });
    });

    describe('when key creation fails', () => {
      it('should throw IInternalServerErrorException when HTTP request fails', async () => {
        const axiosError = {
          response: {
            data: { message: 'Key creation failed' },
            status: 400,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.post.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.createConsumerKey(mockEnvironment, mockConsumerId),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(httpService.post).toHaveBeenCalledTimes(1);
        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'Key creation failed',
        });
      });
    });
  });

  describe('deleteConsumerKey', () => {
    const mockKeyId = 'key-id-123';

    describe('when key deletion succeeds', () => {
      it('should delete API key from consumer successfully', async () => {
        const mockDeleteResponse = {};

        const mockResponse = {
          data: mockDeleteResponse,
          status: 204,
          statusText: 'No Content',
          headers: {},
          config: {},
        } as AxiosResponse<CreateConsumerKeyResponse>;

        httpService.delete.mockReturnValue(of(mockResponse));

        const result = await service.deleteConsumerKey(
          mockEnvironment,
          mockConsumerId,
          mockKeyId,
        );

        expect(result).toEqual(mockDeleteResponse);
        expect(httpService.delete).toHaveBeenCalledTimes(1);
        expect(httpService.delete).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/key-auth/${mockKeyId}`,
        );
      });
    });

    describe('when key deletion fails', () => {
      it('should throw IInternalServerErrorException when HTTP request fails', async () => {
        const axiosError = {
          response: {
            data: { message: 'API key not found' },
            status: 404,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.delete.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.deleteConsumerKey(mockEnvironment, mockConsumerId, mockKeyId),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(httpService.delete).toHaveBeenCalledTimes(1);
        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'API key not found',
        });
      });
    });
  });

  describe('getPlugins', () => {
    describe('when plugins exist', () => {
      it('should return consumer plugins without parameters', async () => {
        const mockPluginsResponse: ListPluginsResponse = {
          data: [mockPlugin],
          next: undefined,
        };

        const mockResponse: AxiosResponse<ListPluginsResponse> = {
          data: mockPluginsResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.get.mockReturnValue(of(mockResponse));

        const result = await service.getPlugins(
          mockEnvironment,
          mockConsumerId,
        );

        expect(result).toEqual(mockPluginsResponse);
        expect(httpService.get).toHaveBeenCalledTimes(1);
        expect(httpService.get).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/plugins`,
          { params: undefined },
        );
      });

      it('should return consumer plugins with optional parameters', async () => {
        const mockParams = {
          name: KONG_PLUGINS.KEY_AUTH,
          offset: 0,
        };
        const mockPluginsResponse: ListPluginsResponse = {
          data: [mockPlugin],
          next: 'next-offset',
        };

        const mockResponse: AxiosResponse<ListPluginsResponse> = {
          data: mockPluginsResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.get.mockReturnValue(of(mockResponse));

        const result = await service.getPlugins(
          mockEnvironment,
          mockConsumerId,
          mockParams,
        );

        expect(result).toEqual(mockPluginsResponse);
        expect(httpService.get).toHaveBeenCalledTimes(1);
        expect(httpService.get).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/plugins`,
          { params: mockParams },
        );
      });
    });

    describe('when request fails', () => {
      it('should throw IInternalServerErrorException when HTTP request fails', async () => {
        const axiosError = {
          response: {
            data: { message: 'Plugins not found' },
            status: 404,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.get.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.getPlugins(mockEnvironment, mockConsumerId),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(httpService.get).toHaveBeenCalledTimes(1);
        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'Plugins not found',
        });
      });
    });
  });

  describe('createPlugin', () => {
    const mockPluginRequest: CreatePluginRequest = {
      name: KONG_PLUGINS.KEY_AUTH,
      config: { key_names: ['apikey'] },
      enabled: true,
    };

    describe('when plugin creation succeeds', () => {
      it('should create plugin without tags and add default tag', async () => {
        const expectedRequest = {
          ...mockPluginRequest,
          tags: [KONG_PLUGINS.KEY_AUTH],
        };
        const mockPluginResponse: CreatePluginResponse = {
          ...mockPlugin,
          ...expectedRequest,
        };

        const mockResponse: AxiosResponse<CreatePluginResponse> = {
          data: mockPluginResponse,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        };

        httpService.post.mockReturnValue(of(mockResponse));

        const result = await service.createPlugin(
          mockEnvironment,
          mockConsumerId,
          mockPluginRequest,
        );

        expect(result).toEqual(mockPluginResponse);
        expect(httpService.post).toHaveBeenCalledTimes(1);
        expect(httpService.post).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/plugins`,
          expectedRequest,
        );
      });

      it('should create plugin with existing tags and add plugin name', async () => {
        const requestWithTags = {
          ...mockPluginRequest,
          tags: ['existing-tag'],
        };
        const expectedRequest = {
          ...requestWithTags,
          tags: ['existing-tag', KONG_PLUGINS.KEY_AUTH],
        };
        const mockPluginResponse: CreatePluginResponse = {
          ...mockPlugin,
          ...expectedRequest,
        };

        const mockResponse: AxiosResponse<CreatePluginResponse> = {
          data: mockPluginResponse,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        };

        httpService.post.mockReturnValue(of(mockResponse));

        const result = await service.createPlugin(
          mockEnvironment,
          mockConsumerId,
          requestWithTags,
        );

        expect(result).toEqual(mockPluginResponse);
        expect(httpService.post).toHaveBeenCalledTimes(1);
        expect(httpService.post).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/plugins`,
          expectedRequest,
        );
      });

      it('should deduplicate tags when plugin name already exists in tags', async () => {
        const requestWithDuplicateTag = {
          ...mockPluginRequest,
          tags: [KONG_PLUGINS.KEY_AUTH, 'other-tag'],
        };
        const expectedRequest = {
          ...requestWithDuplicateTag,
          tags: [KONG_PLUGINS.KEY_AUTH, 'other-tag'],
        };
        const mockPluginResponse: CreatePluginResponse = {
          ...mockPlugin,
          ...expectedRequest,
        };

        const mockResponse: AxiosResponse<CreatePluginResponse> = {
          data: mockPluginResponse,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        };

        httpService.post.mockReturnValue(of(mockResponse));

        const result = await service.createPlugin(
          mockEnvironment,
          mockConsumerId,
          requestWithDuplicateTag,
        );

        expect(result).toEqual(mockPluginResponse);
        expect(httpService.post).toHaveBeenCalledTimes(1);
        expect(httpService.post).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/plugins`,
          expectedRequest,
        );
      });
    });

    describe('when plugin creation fails', () => {
      it('should throw IInternalServerErrorException when HTTP request fails', async () => {
        const axiosError = {
          response: {
            data: { message: 'Plugin creation failed' },
            status: 400,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.post.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.createPlugin(
            mockEnvironment,
            mockConsumerId,
            mockPluginRequest,
          ),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(httpService.post).toHaveBeenCalledTimes(1);
        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'Plugin creation failed',
        });
      });
    });
  });

  describe('updateOrCreatePlugin', () => {
    const mockPluginRequest: CreatePluginRequest = {
      name: KONG_PLUGINS.KEY_AUTH,
      config: { key_names: ['apikey'] },
      enabled: true,
    };

    describe('when plugin does not exist', () => {
      it('should create new plugin', async () => {
        const mockPluginsResponse: ListPluginsResponse = {
          data: [], // No existing plugins
          next: undefined,
        };

        jest
          .spyOn(service, 'getPlugins')
          .mockResolvedValue(mockPluginsResponse);
        jest.spyOn(service, 'createPlugin').mockResolvedValue(mockPlugin);

        const result = await service.updateOrCreatePlugin(
          mockEnvironment,
          mockConsumerId,
          mockPluginRequest,
        );

        expect(result).toEqual(mockPlugin);
        expect(service.getPlugins).toHaveBeenCalledTimes(1);
        expect(service.getPlugins).toHaveBeenCalledWith(
          mockEnvironment,
          mockConsumerId,
        );
        expect(service.createPlugin).toHaveBeenCalledTimes(1);
        expect(service.createPlugin).toHaveBeenCalledWith(
          mockEnvironment,
          mockConsumerId,
          mockPluginRequest,
        );
      });
    });

    describe('when plugin exists', () => {
      it('should update existing plugin without tags', async () => {
        const existingPlugin = {
          ...mockPlugin,
          consumer: { id: mockConsumerId },
        };
        const mockPluginsResponse: ListPluginsResponse = {
          data: [existingPlugin],
          next: undefined,
        };
        const expectedRequest = {
          ...mockPluginRequest,
          tags: [KONG_PLUGINS.KEY_AUTH],
        };
        const updatedPlugin = { ...existingPlugin, ...expectedRequest };

        jest
          .spyOn(service, 'getPlugins')
          .mockResolvedValue(mockPluginsResponse);

        const mockResponse: AxiosResponse<CreatePluginResponse> = {
          data: updatedPlugin,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.put.mockReturnValue(of(mockResponse));

        const result = await service.updateOrCreatePlugin(
          mockEnvironment,
          mockConsumerId,
          mockPluginRequest,
        );

        expect(result).toEqual(updatedPlugin);
        expect(service.getPlugins).toHaveBeenCalledTimes(1);
        expect(httpService.put).toHaveBeenCalledTimes(1);
        expect(httpService.put).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/plugins/${existingPlugin.id}`,
          expectedRequest,
        );
      });

      it('should update existing plugin with existing tags', async () => {
        const existingPlugin = {
          ...mockPlugin,
          consumer: { id: mockConsumerId },
        };
        const mockPluginsResponse: ListPluginsResponse = {
          data: [existingPlugin],
          next: undefined,
        };
        const requestWithTags = {
          ...mockPluginRequest,
          tags: ['existing-tag'],
        };
        const expectedRequest = {
          ...requestWithTags,
          tags: ['existing-tag', KONG_PLUGINS.KEY_AUTH],
        };
        const updatedPlugin = { ...existingPlugin, ...expectedRequest };

        jest
          .spyOn(service, 'getPlugins')
          .mockResolvedValue(mockPluginsResponse);

        const mockResponse: AxiosResponse<CreatePluginResponse> = {
          data: updatedPlugin,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.put.mockReturnValue(of(mockResponse));

        const result = await service.updateOrCreatePlugin(
          mockEnvironment,
          mockConsumerId,
          requestWithTags,
        );

        expect(result).toEqual(updatedPlugin);
        expect(httpService.put).toHaveBeenCalledTimes(1);
        expect(httpService.put).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/plugins/${existingPlugin.id}`,
          expectedRequest,
        );
      });

      it('should deduplicate tags when updating plugin', async () => {
        const existingPlugin = {
          ...mockPlugin,
          consumer: { id: mockConsumerId },
        };
        const mockPluginsResponse: ListPluginsResponse = {
          data: [existingPlugin],
          next: undefined,
        };
        const requestWithDuplicateTag = {
          ...mockPluginRequest,
          tags: [KONG_PLUGINS.KEY_AUTH, 'other-tag'],
        };
        const expectedRequest = {
          ...requestWithDuplicateTag,
          tags: [KONG_PLUGINS.KEY_AUTH, 'other-tag'],
        };
        const updatedPlugin = { ...existingPlugin, ...expectedRequest };

        jest
          .spyOn(service, 'getPlugins')
          .mockResolvedValue(mockPluginsResponse);

        const mockResponse: AxiosResponse<CreatePluginResponse> = {
          data: updatedPlugin,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };

        httpService.put.mockReturnValue(of(mockResponse));

        const result = await service.updateOrCreatePlugin(
          mockEnvironment,
          mockConsumerId,
          requestWithDuplicateTag,
        );

        expect(result).toEqual(updatedPlugin);
        expect(httpService.put).toHaveBeenCalledTimes(1);
        expect(httpService.put).toHaveBeenCalledWith(
          `${mockKongEndpoints[mockEnvironment]}/consumers/${mockConsumerId}/plugins/${existingPlugin.id}`,
          expectedRequest,
        );
      });
    });

    describe('when operations fail', () => {
      it('should throw IInternalServerErrorException when getPlugins fails', async () => {
        jest.spyOn(service, 'getPlugins').mockRejectedValue(
          new IInternalServerErrorException({
            message: 'Failed to fetch plugins',
          }),
        );

        await expect(
          service.updateOrCreatePlugin(
            mockEnvironment,
            mockConsumerId,
            mockPluginRequest,
          ),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(service.getPlugins).toHaveBeenCalledTimes(1);
      });

      it('should throw IInternalServerErrorException when update fails', async () => {
        const existingPlugin = {
          ...mockPlugin,
          consumer: { id: mockConsumerId },
        };
        const mockPluginsResponse: ListPluginsResponse = {
          data: [existingPlugin],
          next: undefined,
        };

        jest
          .spyOn(service, 'getPlugins')
          .mockResolvedValue(mockPluginsResponse);

        const axiosError = {
          response: {
            data: { message: 'Plugin update failed' },
            status: 400,
          },
          isAxiosError: true,
        } as AxiosError;

        httpService.put.mockReturnValue(throwError(() => axiosError));

        await expect(
          service.updateOrCreatePlugin(
            mockEnvironment,
            mockConsumerId,
            mockPluginRequest,
          ),
        ).rejects.toThrow(IInternalServerErrorException);

        expect(service.getPlugins).toHaveBeenCalledTimes(1);
        expect(httpService.put).toHaveBeenCalledTimes(1);
        expect((service as any).logger.error).toHaveBeenCalledWith({
          message: 'Plugin update failed',
        });
      });
    });
  });
});
