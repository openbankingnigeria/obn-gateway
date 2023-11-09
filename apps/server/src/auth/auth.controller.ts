import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  SignupDto,
} from './dto/index.dto';
import { SkipAuthGuard } from 'src/common/utils/authentication/auth.decorator';
import { IRequest } from 'src/common/utils/authentication/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @SkipAuthGuard()
  // TODO Write custom validation pipe
  @UsePipes(ValidationPipe)
  signup(@Body() data: SignupDto) {
    return this.authService.signup(data);
  }

  @Post('login')
  @SkipAuthGuard()
  @UsePipes(ValidationPipe)
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('password/forgot')
  @SkipAuthGuard()
  @UsePipes(ValidationPipe)
  forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.authService.forgotPassword(email);
  }

  @Post('password/reset/:resetToken')
  @SkipAuthGuard()
  @UsePipes(ValidationPipe)
  resetPassword(
    @Body() data: ResetPasswordDto,
    @Param('resetToken') resetToken: string,
  ) {
    return this.authService.resetPassword(data, resetToken);
  }

  @Patch('password/change')
  @UsePipes(ValidationPipe)
  changePassword(@Body() data: ResetPasswordDto, @Req() { user }: IRequest) {
    return this.authService.resetPassword(data, user!);
  }
}
