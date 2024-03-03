import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipAuthGuard } from './common/utils/authentication/auth.decorator';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @SkipAuthGuard()
  @SerializeOptions({
    strategy: 'exposeAll',
  })
  health() {
    return this.appService.health();
  }
}
