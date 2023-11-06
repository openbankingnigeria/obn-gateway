import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

/**
 * This class provides authentication functionalities and can be injected into other services
 */
@Injectable()
export class Auth {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *
   * @param payload The payload to be signed
   * @param options JWT sign options.
   * @returns A signed token
   */
  async sign(payload: object, options?: JwtSignOptions) {
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('auth.jwtExpires'),
      secret: this.config.get('auth.jwtSecret'),
      ...options,
    });

    return token;
  }

  /**
   *
   * @param token The token to be decoded
   * @returns The decoded payload
   */
  async verify<T extends object>(token: string) {
    const decoded = await this.jwtService.verifyAsync<T>(token);

    return decoded;
  }

  async getResetPasswordToken() {
    // Generate token
    const resetToken = randomBytes(20).toString('hex');

    const hashedResetToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    return { resetToken, hashedResetToken };
  }
}
