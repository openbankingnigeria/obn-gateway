import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Auth } from './auth.helper';

describe('Auth', () => {
  let auth: Auth;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'auth.jwtSecret':
            return 'test-jwt-secret';
          case 'auth.jwtExpires':
            return '1h';
          default:
            return null;
        }
      }),
    } as any;

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Auth,
        { provide: ConfigService, useValue: configService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    auth = module.get<Auth>(Auth);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(auth).toBeDefined();
  });

  it('verify uses the secret captured at construction even if ConfigService changes later', async () => {
    jwtService.verifyAsync.mockResolvedValue({ ok: true });

    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'auth.jwtSecret':
          return 'mutated-secret';
        case 'auth.jwtExpires':
          return '2h';
        default:
          return null;
      }
    });

    await auth.verify('token');
    expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
      secret: 'test-jwt-secret',
    });
  });

  it('sign passes exactly the provided custom options when all keys are supplied', async () => {
    const payload = { userId: '123' };
    const options = {
      secret: 'custom-secret',
      expiresIn: '30m',
      issuer: 'test-issuer',
      audience: 'test-audience',
    };
    jwtService.signAsync.mockResolvedValue('token');

    await auth.sign(payload, options);

    expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
    expect(jwtService.signAsync).toHaveBeenCalledWith(payload, options);
  });

  describe('sign', () => {
    describe('when signing with default options', () => {
      it('should successfully sign token with default secret and expires', async () => {
        const payload = { userId: '123', role: 'admin' };
        const expectedToken = 'signed-jwt-token';
        jwtService.signAsync.mockResolvedValue(expectedToken);

        const result = await auth.sign(payload);

        expect(result).toBe(expectedToken);
        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
          expiresIn: '1h',
          secret: 'test-jwt-secret',
        });
      });

      it('should use configured JWT secret when no custom secret provided', async () => {
        const payload = { userId: '123' };
        jwtService.signAsync.mockResolvedValue('token');

        await auth.sign(payload);

        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledWith(
          payload,
          expect.objectContaining({
            secret: 'test-jwt-secret',
          }),
        );
      });

      it('should use configured JWT expires when no custom expires provided', async () => {
        const payload = { userId: '123' };
        jwtService.signAsync.mockResolvedValue('token');

        await auth.sign(payload);

        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledWith(
          payload,
          expect.objectContaining({
            expiresIn: '1h',
          }),
        );
      });
    });

    describe('when signing with custom options', () => {
      it('should successfully sign token with custom secret', async () => {
        const payload = { userId: '123' };
        const customSecret = 'custom-secret';
        const options = { secret: customSecret };
        jwtService.signAsync.mockResolvedValue('token');

        await auth.sign(payload, options);

        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledWith(
          payload,
          expect.objectContaining({
            secret: customSecret,
            expiresIn: '1h',
          }),
        );
      });

      it('should successfully sign token with custom expires time', async () => {
        const payload = { userId: '123' };
        const customExpires = '2h';
        const options = { expiresIn: customExpires };
        jwtService.signAsync.mockResolvedValue('token');

        await auth.sign(payload, options);

        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledWith(
          payload,
          expect.objectContaining({
            expiresIn: customExpires,
            secret: 'test-jwt-secret',
          }),
        );
      });

      it('should successfully sign token with all custom options', async () => {
        const payload = { userId: '123' };
        const options = {
          secret: 'custom-secret',
          expiresIn: '30m',
          issuer: 'test-issuer',
          audience: 'test-audience',
        };
        jwtService.signAsync.mockResolvedValue('token');

        await auth.sign(payload, options);

        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledWith(payload, options);
      });

      it('should override default options with provided custom options', async () => {
        const payload = { userId: '123' };
        const options = {
          secret: 'override-secret',
          expiresIn: '15m',
        };
        jwtService.signAsync.mockResolvedValue('token');

        await auth.sign(payload, options);

        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledWith(
          payload,
          expect.objectContaining({
            secret: 'override-secret',
            expiresIn: '15m',
          }),
        );
        expect(jwtService.signAsync).not.toHaveBeenCalledWith(
          payload,
          expect.objectContaining({
            secret: 'test-jwt-secret',
            expiresIn: '1h',
          }),
        );
      });
    });

    describe('when signing fails', () => {
      it('should throw error when JWT service fails to sign', async () => {
        const payload = { userId: '123' };
        const error = new Error('JWT signing failed');
        jwtService.signAsync.mockRejectedValue(error);

        await expect(auth.sign(payload)).rejects.toThrow('JWT signing failed');
      });

      it('should handle empty payload object', async () => {
        const payload = {};
        jwtService.signAsync.mockResolvedValue('token');

        const result = await auth.sign(payload);

        expect(result).toBe('token');
        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledWith(
          payload,
          expect.any(Object),
        );
      });
    });
  });

  describe('verify', () => {
    describe('when verifying with default secret', () => {
      it('should successfully verify token with default secret', async () => {
        const token = 'valid-jwt-token';
        const decodedPayload = {
          userId: '123',
          role: 'admin',
          iat: 1234567890,
          exp: 1234571490,
        };
        jwtService.verifyAsync.mockResolvedValue(decodedPayload);

        const result = await auth.verify(token);

        expect(result).toEqual(decodedPayload);
        expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
          secret: 'test-jwt-secret',
        });
      });

      it('should return decoded payload with correct type', async () => {
        const token = 'valid-jwt-token';
        const decodedPayload = { userId: '123', role: 'admin' };
        jwtService.verifyAsync.mockResolvedValue(decodedPayload);

        const result = await auth.verify<{ userId: string; role: string }>(
          token,
        );

        expect(result).toEqual(decodedPayload);
        expect(typeof result.userId).toBe('string');
        expect(typeof result.role).toBe('string');
      });

      it('should use configured JWT secret when no custom secret provided', async () => {
        const token = 'valid-jwt-token';
        jwtService.verifyAsync.mockResolvedValue({ userId: '123' });

        await auth.verify(token);

        expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
          secret: 'test-jwt-secret',
        });
      });
    });

    describe('when verifying with custom secret', () => {
      it('should successfully verify token with custom secret', async () => {
        const token = 'valid-jwt-token';
        const customSecret = 'custom-verify-secret';
        const decodedPayload = { userId: '456' };
        jwtService.verifyAsync.mockResolvedValue(decodedPayload);

        const result = await auth.verify(token, customSecret);

        expect(result).toEqual(decodedPayload);
        expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
          secret: customSecret,
        });
      });

      it('should use provided custom secret instead of default', async () => {
        const token = 'valid-jwt-token';
        const customSecret = 'override-secret';
        jwtService.verifyAsync.mockResolvedValue({ userId: '123' });

        await auth.verify(token, customSecret);

        expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
        expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
          secret: customSecret,
        });
        expect(jwtService.verifyAsync).not.toHaveBeenCalledWith(token, {
          secret: 'test-jwt-secret',
        });
      });
    });

    describe('when verification fails', () => {
      it('should throw error when token is invalid', async () => {
        const token = 'invalid-jwt-token';
        const error = new Error('Invalid token');
        jwtService.verifyAsync.mockRejectedValue(error);

        await expect(auth.verify(token)).rejects.toThrow('Invalid token');
      });

      it('should throw error when token is expired', async () => {
        const token = 'expired-jwt-token';
        const error = new Error('Token expired');
        jwtService.verifyAsync.mockRejectedValue(error);

        await expect(auth.verify(token)).rejects.toThrow('Token expired');
      });

      it('should throw error when secret is wrong', async () => {
        const token = 'valid-jwt-token';
        const wrongSecret = 'wrong-secret';
        const error = new Error('Invalid signature');
        jwtService.verifyAsync.mockRejectedValue(error);

        await expect(auth.verify(token, wrongSecret)).rejects.toThrow(
          'Invalid signature',
        );
      });

      it('should throw error when token format is malformed', async () => {
        const token = 'malformed.token';
        const error = new Error('Malformed token');
        jwtService.verifyAsync.mockRejectedValue(error);

        await expect(auth.verify(token)).rejects.toThrow('Malformed token');
      });
    });

    describe('when verifying different token types', () => {
      it('should handle tokens with different payload structures', async () => {
        const token = 'valid-jwt-token';
        const complexPayload = {
          userId: '123',
          permissions: ['read', 'write'],
          metadata: { department: 'IT', level: 5 },
        };
        jwtService.verifyAsync.mockResolvedValue(complexPayload);

        const result = await auth.verify(token);

        expect(result).toEqual(complexPayload);
        expect(Array.isArray((result as any).permissions)).toBe(true);
        expect(typeof (result as any).metadata).toBe('object');
      });

      it('should maintain generic type information', async () => {
        const token = 'valid-jwt-token';
        interface CustomPayload {
          id: number;
          email: string;
          active: boolean;
        }
        const payload: CustomPayload = {
          id: 123,
          email: 'test@example.com',
          active: true,
        };
        jwtService.verifyAsync.mockResolvedValue(payload);

        const result = await auth.verify<CustomPayload>(token);

        expect(result.id).toBe(123);
        expect(result.email).toBe('test@example.com');
        expect(result.active).toBe(true);
      });
    });
  });

  describe('getToken', () => {
    it('should generate random hex string token', async () => {
      const result = await auth.getToken();

      expect(typeof result).toBe('string');
      expect(result).toHaveLength(40);
      expect(result).toMatch(/^[0-9a-f]{40}$/);
    });

    it('should generate different tokens on multiple calls', async () => {
      const token1 = await auth.getToken();
      const token2 = await auth.getToken();
      const token3 = await auth.getToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
      expect(new Set([token1, token2, token3])).toHaveProperty('size', 3);
    });

    it('should always return 40-character hex strings', async () => {
      const tokens = await Promise.all([
        auth.getToken(),
        auth.getToken(),
        auth.getToken(),
        auth.getToken(),
        auth.getToken(),
      ]);

      tokens.forEach((token) => {
        expect(token).toHaveLength(40);
        expect(token).toMatch(/^[0-9a-f]{40}$/);
      });
    });
  });

  describe('hashToken', () => {
    it('should hash token using SHA256 and return consistent hash', async () => {
      const token = 'test-token-123';

      const hash1 = await auth.hashToken(token);
      const hash2 = await auth.hashToken(token);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1).toHaveLength(64);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce different hashes for different inputs', async () => {
      const hash1 = await auth.hashToken('token1');
      const hash2 = await auth.hashToken('token2');
      const hash3 = await auth.hashToken('token3');

      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
      expect(hash1).not.toBe(hash3);
      expect(new Set([hash1, hash2, hash3]).size).toBe(3);
    });

    it('should handle empty string input', async () => {
      const hash = await auth.hashToken('');

      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should handle special characters in tokens', async () => {
      const specialToken = 'token!@#$%^&*()_+-={}[]|\\:;",.<>?/~`';

      const hash = await auth.hashToken(specialToken);

      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should handle very long token strings', async () => {
      const longToken = 'a'.repeat(10000);

      const hash = await auth.hashToken(longToken);

      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce same hash for identical tokens', async () => {
      const token = 'identical-token';

      const results = await Promise.all([
        auth.hashToken(token),
        auth.hashToken(token),
        auth.hashToken(token),
      ]);

      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
      expect(new Set(results).size).toBe(1);
    });
  });
});
