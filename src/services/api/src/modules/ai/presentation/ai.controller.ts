import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AiDifficulty, CellValue, Player } from '@caro/shared';
import { GetAiMoveUseCase } from '../application/get-ai-move.use-case';

@Controller('ai')
export class AiController {
  constructor(private readonly getAiMove: GetAiMoveUseCase) {}

  @Post('move')
  move(@Body() body: unknown) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Dữ liệu yêu cầu không hợp lệ.');
    }
    const request = body as Record<string, unknown>;
    return this.getAiMove.execute(
      request.board as CellValue[],
      request.ai_player as Player,
      request.difficulty as AiDifficulty,
    );
  }
}
