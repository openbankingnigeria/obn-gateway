import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  BaseSignupDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResendOtpDto,
  ResetPasswordDto,
  SetupDto,
  signupDtos,
  TwoFADto,
  VerifyEmailDto,
} from './dto/index.dto';
import { SkipAuthGuard } from '@common/utils/authentication/auth.decorator';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @SkipAuthGuard()
  @UsePipes(IValidationPipe)
  async signup(@Body() data: BaseSignupDto) {
    const validationPipe = new IValidationPipe();

    await validationPipe.transform(data, {
      type: 'body',
      metatype: signupDtos[data.companyType],
    });

    return this.authService.signup(data, data.companyType);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SkipAuthGuard()
  @UsePipes(IValidationPipe)
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @SkipAuthGuard()
  @UsePipes(IValidationPipe)
  refresh(@Body() data: RefreshTokenDto) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @SkipAuthGuard()
  @UsePipes(IValidationPipe)
  verifyEmail(@Body() data: VerifyEmailDto) {
    return this.authService.verifyEmail(data);
  }

  // TODO rate limit
  @Post('otp/resend')
  @HttpCode(HttpStatus.OK)
  @SkipAuthGuard()
  @UsePipes(IValidationPipe)
  resendOtp(@Body() data: ResendOtpDto) {
    return this.authService.resendOtp(data);
  }

  @Post('login/two-fa')
  @SkipAuthGuard()
  @UsePipes(IValidationPipe)
  twoFA(@Body() data: TwoFADto) {
    return this.authService.login(data);
  }

  @Post('password/forgot')
  @SkipAuthGuard()
  @UsePipes(IValidationPipe)
  forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.authService.forgotPassword(email);
  }

  @Post('password/reset/:resetToken')
  @HttpCode(HttpStatus.OK)
  @SkipAuthGuard()
  @UsePipes(IValidationPipe)
  resetPassword(
    @Body() data: ResetPasswordDto,
    @Param('resetToken') resetToken: string,
  ) {
    return this.authService.resetPassword(data, resetToken);
  }

  @Post('setup/:token')
  @SkipAuthGuard()
  @UsePipes(IValidationPipe)
  setup(@Body() data: SetupDto, @Param('token') token: string) {
    return this.authService.setup(data, token);
  }
}
