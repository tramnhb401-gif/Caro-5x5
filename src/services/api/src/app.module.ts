import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { HistoryModule } from './modules/history/history.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ?? 'mongodb://localhost:27017/caro',
      }),
    }),
    HealthModule,
    AuthModule,
    AiModule,
    HistoryModule,
    LeaderboardModule,
    ...(process.env.SERVE_WEB === 'true'
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), '../../apps/mobile/dist'),
          }),
        ]
      : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
