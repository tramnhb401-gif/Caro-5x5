import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async list() {
    const users = await this.userModel
      .find()
      .select('username elo wins losses')
      .sort({ elo: -1, wins: -1, username: 1 })
      .limit(100)
      .lean()
      .exec();
    return users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      elo: user.elo,
      wins: user.wins,
      losses: user.losses,
    }));
  }
}
