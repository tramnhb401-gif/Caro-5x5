import { Module } from '@nestjs/common';
import { HealthController } from './presentation/health.controller';
import { GetHealthStatusUseCase } from './application/get-health-status.use-case';

@Module({
  controllers: [HealthController],
  providers: [GetHealthStatusUseCase],
})
export class HealthModule {}
