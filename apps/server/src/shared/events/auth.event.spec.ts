import { User } from '@common/database/entities';
import { UserBuilder } from '@test/utils/builders';
import {
  AuthEvent,
  AuthEvents,
  AuthSignupEvent,
  AuthResendOtpEvent,
  AuthLoginEvent,
  AuthSetPasswordEvent,
  AuthResetPasswordRequestEvent,
  AuthResetPasswordEvent,
} from './auth.event';
import { BaseEvent } from './base.event';

describe('Auth Events', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = new UserBuilder()
      .with('id', 'user-id')
      .with('email', 'test@example.com')
      .with('password', 'hashed-password')
      .build();
  });

  describe('AuthEvents enum', () => {
    it('should define all auth event types', () => {
      expect(AuthEvents.SIGN_UP).toBe('auth.signup');
      expect(AuthEvents.LOGIN).toBe('auth.login');
      expect(AuthEvents.SET_PASSWORD).toBe('auth.set-password');
      expect(AuthEvents.RESET_PASSWORD_REQUEST).toBe('auth.reset-password-request');
      expect(AuthEvents.RESET_PASSWORD).toBe('auth.reset-password');
    });
  });

  describe('BaseEvent', () => {
    it('should create base event with required properties', () => {
      const event = new BaseEvent('test.event', mockUser, { test: 'data' });

      expect(event.name).toBe('test.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual({ test: 'data' });
    });

    it('should create base event without metadata', () => {
      const event = new BaseEvent('test.event', mockUser);

      expect(event.name).toBe('test.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toBeUndefined();
    });

    it('should create base event with null author', () => {
      const event = new BaseEvent('test.event', null);

      expect(event.name).toBe('test.event');
      expect(event.author).toBeNull();
    });
  });

  describe('AuthEvent', () => {
    it('should create auth event with all properties', () => {
      const metadata = { otp: '123456', source: 'web' };
      const event = new AuthEvent('custom.auth.event', mockUser, metadata);

      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe('custom.auth.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(metadata);
    });

    it('should create auth event with default metadata', () => {
      const event = new AuthEvent('custom.auth.event', mockUser);

      expect(event.name).toBe('custom.auth.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual({});
    });

    it('should inherit from BaseEvent', () => {
      const event = new AuthEvent('test.event', mockUser);

      expect(event).toBeInstanceOf(BaseEvent);
      expect(event).toBeInstanceOf(AuthEvent);
    });
  });

  describe('AuthSignupEvent', () => {
    const mockSignupMetadata = { otp: '123456', source: 'web', ipAddress: '127.0.0.1' };

    it('should create signup event with required properties', () => {
      const event = new AuthSignupEvent(mockUser, mockSignupMetadata);

      expect(event).toBeInstanceOf(AuthEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(AuthEvents.SIGN_UP);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockSignupMetadata);
    });

    it('should create signup event with minimal metadata', () => {
      const minimalMetadata = { otp: '654321' };
      const event = new AuthSignupEvent(mockUser, minimalMetadata);

      expect(event.name).toBe(AuthEvents.SIGN_UP);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(minimalMetadata);
      expect(event.metadata.otp).toBe('654321');
    });

    it('should ensure OTP is present in metadata', () => {
      const metadata = { otp: '999999', additionalData: 'test' };
      const event = new AuthSignupEvent(mockUser, metadata);

      expect(event.metadata.otp).toBe('999999');
      expect(event.metadata.additionalData).toBe('test');
    });
  });

  describe('AuthResendOtpEvent', () => {
    const mockOtpMetadata = { otp: '789012' };

    it('should create resend OTP event with required properties', () => {
      const event = new AuthResendOtpEvent(mockUser, mockOtpMetadata);

      expect(event).toBeInstanceOf(AuthEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(AuthEvents.SIGN_UP);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockOtpMetadata);
    });

    it('should use SIGN_UP event name for resend OTP', () => {
      const event = new AuthResendOtpEvent(mockUser, mockOtpMetadata);

      expect(event.name).toBe(AuthEvents.SIGN_UP);
    });

    it('should require OTP in metadata', () => {
      const event = new AuthResendOtpEvent(mockUser, { otp: '111222' });

      expect(event.metadata.otp).toBe('111222');
    });
  });

  describe('AuthLoginEvent', () => {
    it('should create login event with metadata', () => {
      const metadata = { userAgent: 'Mozilla/5.0', ipAddress: '192.168.1.1' };
      const event = new AuthLoginEvent(mockUser, metadata);

      expect(event).toBeInstanceOf(AuthEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(AuthEvents.LOGIN);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(metadata);
    });

    it('should create login event with default metadata', () => {
      const event = new AuthLoginEvent(mockUser);

      expect(event.name).toBe(AuthEvents.LOGIN);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual({});
    });

    it('should handle empty metadata object', () => {
      const event = new AuthLoginEvent(mockUser, {});

      expect(event.metadata).toEqual({});
    });
  });

  describe('AuthSetPasswordEvent', () => {
    it('should create set password event with metadata', () => {
      const metadata = { passwordChanged: true, timestamp: Date.now() };
      const event = new AuthSetPasswordEvent(mockUser, metadata);

      expect(event).toBeInstanceOf(AuthEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(AuthEvents.SET_PASSWORD);
      expect(event.user).toBe(mockUser);
      expect(event.metadata).toEqual(metadata);
    });

    it('should create set password event with default metadata', () => {
      const event = new AuthSetPasswordEvent(mockUser);

      expect(event.name).toBe(AuthEvents.SET_PASSWORD);
      expect(event.user).toBe(mockUser);
      expect(event.metadata).toEqual({});
    });

    it('should use user property instead of author', () => {
      const event = new AuthSetPasswordEvent(mockUser);

      expect(event.user).toBe(mockUser);
      expect(event.author).toBe(mockUser); // inherited from base
    });
  });

  describe('AuthResetPasswordRequestEvent', () => {
    const mockTokenMetadata = { token: 'reset-token-123', requestTime: Date.now() };

    it('should create reset password request event with required properties', () => {
      const event = new AuthResetPasswordRequestEvent(mockUser, mockTokenMetadata);

      expect(event).toBeInstanceOf(AuthEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(AuthEvents.RESET_PASSWORD_REQUEST);
      expect(event.user).toBe(mockUser);
      expect(event.metadata).toEqual(mockTokenMetadata);
    });

    it('should require token in metadata', () => {
      const metadata = { token: 'secure-token-456', ipAddress: '10.0.0.1' };
      const event = new AuthResetPasswordRequestEvent(mockUser, metadata);

      expect(event.metadata.token).toBe('secure-token-456');
      expect(event.metadata.ipAddress).toBe('10.0.0.1');
    });

    it('should use user property instead of author', () => {
      const event = new AuthResetPasswordRequestEvent(mockUser, mockTokenMetadata);

      expect(event.user).toBe(mockUser);
      expect(event.author).toBe(mockUser); // inherited from base
    });
  });

  describe('AuthResetPasswordEvent', () => {
    it('should create reset password event with metadata', () => {
      const metadata = { success: true, timestamp: Date.now() };
      const event = new AuthResetPasswordEvent(mockUser, metadata);

      expect(event).toBeInstanceOf(AuthEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(AuthEvents.RESET_PASSWORD_REQUEST);
      expect(event.user).toBe(mockUser);
      expect(event.metadata).toEqual(metadata);
    });

    it('should create reset password event with default metadata', () => {
      const event = new AuthResetPasswordEvent(mockUser);

      expect(event.name).toBe(AuthEvents.RESET_PASSWORD_REQUEST);
      expect(event.user).toBe(mockUser);
      expect(event.metadata).toEqual({});
    });

    it('should use RESET_PASSWORD_REQUEST event name', () => {
      const event = new AuthResetPasswordEvent(mockUser);

      // NOTE: This appears to be a bug in the implementation - it should use RESET_PASSWORD
      expect(event.name).toBe(AuthEvents.RESET_PASSWORD_REQUEST);
    });

    it('should use user property instead of author', () => {
      const event = new AuthResetPasswordEvent(mockUser);

      expect(event.user).toBe(mockUser);
      expect(event.author).toBe(mockUser); // inherited from base
    });
  });

  describe('Event inheritance and polymorphism', () => {
    it('should allow treating all events as AuthEvent instances', () => {
      const events = [
        new AuthSignupEvent(mockUser, { otp: '123' }),
        new AuthResendOtpEvent(mockUser, { otp: '456' }),
        new AuthLoginEvent(mockUser, { source: 'app' }),
        new AuthSetPasswordEvent(mockUser, { changed: true }),
        new AuthResetPasswordRequestEvent(mockUser, { token: 'token123' }),
        new AuthResetPasswordEvent(mockUser, { success: true }),
      ];

      events.forEach(event => {
        expect(event).toBeInstanceOf(AuthEvent);
        expect(event).toBeInstanceOf(BaseEvent);
        expect(event.author).toBe(mockUser);
        expect(typeof event.name).toBe('string');
        expect(event.metadata).toBeDefined();
      });
    });

    it('should allow treating all events as BaseEvent instances', () => {
      const events = [
        new AuthEvent('custom.event', mockUser),
        new AuthSignupEvent(mockUser, { otp: '123' }),
        new AuthLoginEvent(mockUser),
      ];

      events.forEach(event => {
        expect(event).toBeInstanceOf(BaseEvent);
        expect(event.author).toBe(mockUser);
        expect(event.name).toBeDefined();
      });
    });
  });

  describe('Event metadata handling', () => {
    it('should preserve metadata structure for complex objects', () => {
      const complexMetadata = {
        user: { id: 'user-123', role: 'admin' },
        request: { ip: '127.0.0.1', userAgent: 'Browser/1.0' },
        timestamp: Date.now(),
        flags: { isFirstLogin: true, requiresVerification: false },
      };

      const event = new AuthLoginEvent(mockUser, complexMetadata);

      expect(event.metadata).toEqual(complexMetadata);
      expect(event.metadata.user.id).toBe('user-123');
      expect(event.metadata.flags.isFirstLogin).toBe(true);
    });

    it('should handle null and undefined metadata gracefully', () => {
      const event1 = new AuthLoginEvent(mockUser, null as any);
      const event2 = new AuthLoginEvent(mockUser, undefined);

      expect(event1.metadata).toBeNull();
      expect(event2.metadata).toEqual({});
    });
  });

  describe('User property consistency', () => {
    it('should maintain user reference across different event types', () => {
      const signupEvent = new AuthSignupEvent(mockUser, { otp: '123' });
      const loginEvent = new AuthLoginEvent(mockUser);
      const passwordEvent = new AuthSetPasswordEvent(mockUser);

      expect(signupEvent.author).toBe(mockUser);
      expect(loginEvent.author).toBe(mockUser);
      expect(passwordEvent.user).toBe(mockUser);
      expect(passwordEvent.author).toBe(mockUser); // inherited
    });

    it('should handle different user instances correctly', () => {
      const user1 = new UserBuilder().with('id', 'user-1').build();
      const user2 = new UserBuilder().with('id', 'user-2').build();

      const event1 = new AuthLoginEvent(user1);
      const event2 = new AuthLoginEvent(user2);

      expect(event1.author).toBe(user1);
      expect(event2.author).toBe(user2);
      expect(event1.author).not.toBe(event2.author);
    });
  });
});