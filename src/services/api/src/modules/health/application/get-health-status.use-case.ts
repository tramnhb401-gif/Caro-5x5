import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class GetHealthStatusUseCase {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  executeLive() {
    return {
      status: 'ok',
      service: 'caro-api',
      timestamp: new Date().toISOString(),
    };
  }

  executeReady() {
    const databaseConnected = this.connection.readyState === 1;
    return {
      status: databaseConnected ? 'ready' : 'not_ready',
      service: 'caro-api',
      timestamp: new Date().toISOString(),
      checks: {
        application: 'up',
        database: databaseConnected ? 'up' : 'down',
      },
    };
  }
}
