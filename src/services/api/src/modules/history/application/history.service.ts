import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AiDifficulty, GameMode, Player } from '@caro/shared';
import { Model } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { MatchHistory } from '../schemas/match-history.schema';

export interface CreateMatchHistoryInput {
  mode: GameMode;
  difficulty?: AiDifficulty;
  winner: Player | 'DRAW';
  totalMoves: number;
}

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(MatchHistory.name)
    private readonly historyModel: Model<MatchHistory>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async list(userId: string) {
    const matches = await this.historyModel
      .find({ userId })
      .sort({ playedAt: -1 })
      .limit(100)
      .lean()
      .exec();
    return matches.map((match) => this.toDto(match));
  }

  async create(userId: string, input: CreateMatchHistoryInput) {
    this.validate(input);
    const match = await this.historyModel.create({
      ...input,
      userId,
      playedAt: new Date(),
    });
    if (input.mode === 'PVE')
      await this.applyPlayerOutcome(userId, input.winner);
    return this.toDto(match);
  }

  async clear(userId: string): Promise<{ deletedCount: number }> {
    const result = await this.historyModel.deleteMany({ userId }).exec();
    return { deletedCount: result.deletedCount };
  }

  private async applyPlayerOutcome(userId: string, winner: Player | 'DRAW') {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return;

    if (winner === 'DRAW') {
      user.draws += 1;
      user.elo = Math.max(100, user.elo + 5);
    } else if (winner === 'X') {
      user.wins += 1;
      user.elo += 25;
    } else {
      user.losses += 1;
      user.elo = Math.max(100, user.elo - 15);
    }
    await user.save();
  }

  private validate(input: CreateMatchHistoryInput) {
    if (!input || !['PVP_LOCAL', 'PVE'].includes(input.mode)) {
      throw new BadRequestException('mode không hợp lệ.');
    }
    if (
      input.mode === 'PVE' &&
      !['easy', 'medium', 'hard'].includes(input.difficulty ?? '')
    ) {
      throw new BadRequestException('difficulty không hợp lệ.');
    }
    if (!['X', 'O', 'DRAW'].includes(input.winner)) {
      throw new BadRequestException('winner không hợp lệ.');
    }
    if (
      !Number.isInteger(input.totalMoves) ||
      input.totalMoves < 1 ||
      input.totalMoves > 25
    ) {
      throw new BadRequestException('totalMoves phải từ 1 đến 25.');
    }
  }

  private toDto(match: {
    id?: string;
    _id?: { toString(): string };
    mode: GameMode;
    difficulty?: AiDifficulty;
    winner: Player | 'DRAW';
    totalMoves: number;
    playedAt: Date;
  }) {
    return {
      id: match.id ?? match._id?.toString(),
      mode: match.mode,
      ...(match.difficulty ? { difficulty: match.difficulty } : {}),
      winner: match.winner,
      totalMoves: match.totalMoves,
      playedAt: match.playedAt.toISOString(),
    };
  }
}
