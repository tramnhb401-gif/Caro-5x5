import { Module } from '@nestjs/common';
import { AiController } from './presentation/ai.controller';
import { GetAiMoveUseCase } from './application/get-ai-move.use-case';

@Module({
  controllers: [AiController],
  providers: [GetAiMoveUseCase],
})
export class AiModule {}
