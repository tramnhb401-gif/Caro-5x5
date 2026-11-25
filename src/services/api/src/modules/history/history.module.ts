import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { HistoryService } from './application/history.service';
import { HistoryController } from './presentation/history.controller';
import {
  MatchHistory,
  MatchHistorySchema,
} from './schemas/match-history.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: MatchHistory.name, schema: MatchHistorySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
