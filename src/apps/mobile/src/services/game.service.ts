import { httpClient } from '../core/http/client';
import {
  mapAiMoveRequestToDto,
  mapAiMoveResponseDtoToIndex,
} from '../mappers/game.mapper';
import { AiMoveResponseDto } from '../types/game.dto';
import { AiMoveRequest } from '../types/game.type';

const hasRemoteApi = () => Boolean(process.env.EXPO_PUBLIC_API_URL);

export const gameService = {
  async requestAiMove(req: AiMoveRequest): Promise<number | null> {
    const emptyIndices = req.board
      .map((cell, idx) => (cell === null ? idx : -1))
      .filter((idx) => idx !== -1);

    if (emptyIndices.length === 0) {
      return null;
    }

    const payloadDto = mapAiMoveRequestToDto(req);

    if (hasRemoteApi()) {
      const responseDto = await httpClient.post<AiMoveResponseDto>(
        '/api/v1/ai/move',
        payloadDto,
      );
      return mapAiMoveResponseDtoToIndex(responseDto);
    }

    await new Promise((resolve) => setTimeout(resolve, 450));
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    const mockResponseDto: AiMoveResponseDto = {
      move_index: emptyIndices[randomIndex],
    };
    return mapAiMoveResponseDtoToIndex(mockResponseDto);
  },
};
