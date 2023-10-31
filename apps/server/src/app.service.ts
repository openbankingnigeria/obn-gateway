import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'active',
      timestamp: moment().toISOString(),
    };
  }
}
