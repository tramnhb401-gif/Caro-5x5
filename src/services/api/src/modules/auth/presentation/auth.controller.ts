import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { AuthGuard } from '../application/auth.guard';

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: RegisterBody) {
    const input = this.requireFields(body, ['username', 'email', 'password']);
    return this.authService.register(
      input.username,
      input.email,
      input.password,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginBody) {
    const input = this.requireFields(body, ['email', 'password']);
    return this.authService.login(input.email, input.password);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() request: { userId: string }) {
    return this.authService.getUserProfile(request.userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Headers('authorization') authorization?: string) {
    return this.authService.logout(authorization);
  }

  private requireFields(
    body: unknown,
    fields: string[],
  ): Record<string, string> {
    const values = body as Record<string, unknown> | undefined;
    if (
      !values ||
      fields.some(
        (field) =>
          typeof values[field] !== 'string' || values[field].length === 0,
      )
    ) {
      throw new BadRequestException('Dữ liệu yêu cầu không hợp lệ.');
    }
    return values as Record<string, string>;
  }
}
