import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from '../application/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  list() {
    return this.leaderboardService.list();
  }
}
