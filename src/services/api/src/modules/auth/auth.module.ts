import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSession, AuthSessionSchema } from './schemas/auth-session.schema';
import { User, UserSchema } from './schemas/user.schema';
import { AuthGuard } from './application/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuthSession.name, schema: AuthSessionSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
