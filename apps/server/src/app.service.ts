import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {}

  health() {
    return {
      status: 'active',
      timestamp: moment().toISOString(),
    };
  }
}
