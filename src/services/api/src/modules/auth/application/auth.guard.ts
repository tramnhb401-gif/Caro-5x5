import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

interface AuthenticatedRequest extends Request {
  headers: Request['headers'] & { authorization?: string };
  userId?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new UnauthorizedException('Cần đăng nhập.');

    const userId = await this.authService.getActiveUserId(token);
    if (!userId)
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');
    request.userId = userId;
    return true;
  }
}
