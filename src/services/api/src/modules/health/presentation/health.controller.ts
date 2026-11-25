import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { GetHealthStatusUseCase } from '../application/get-health-status.use-case';

@Controller('health')
export class HealthController {
  constructor(
    private readonly getHealthStatusUseCase: GetHealthStatusUseCase,
  ) {}

  @Get('live')
  checkLive() {
    return this.getHealthStatusUseCase.executeLive();
  }

  @Get('ready')
  checkReady() {
    const status = this.getHealthStatusUseCase.executeReady();
    if (status.status !== 'ready') {
      throw new ServiceUnavailableException(status);
    }
    return status;
  }
}
