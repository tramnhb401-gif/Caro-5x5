import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthSession } from '../schemas/auth-session.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(AuthSession.name)
    private readonly sessionModel: Model<AuthSession>,
  ) {}

  async register(username: string, email: string, password: string) {
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    this.validateCredentials(normalizedUsername, normalizedEmail, password);
    if (await this.userModel.exists({ email: normalizedEmail })) {
      throw new ConflictException('Email đã được sử dụng.');
    }

    const passwordSalt = randomBytes(16).toString('hex');
    let user: UserDocument;
    try {
      user = await this.userModel.create({
        username: normalizedUsername,
        email: normalizedEmail,
        passwordSalt,
        passwordHash: this.hashPassword(password, passwordSalt),
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Email đã được sử dụng.');
      }
      throw error;
    }
    return this.createSession(user);
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userModel
      .findOne({ email: normalizedEmail })
      .select('+passwordSalt +passwordHash')
      .exec();
    if (
      !user ||
      !this.passwordMatches(password, user.passwordSalt, user.passwordHash)
    ) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }
    return this.createSession(user);
  }

  async logout(authorization?: string): Promise<{ message: string }> {
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (match) {
      await this.sessionModel
        .deleteOne({ tokenHash: this.hashToken(match[1]) })
        .exec();
    }
    return { message: 'Đăng xuất thành công.' };
  }

  async getActiveUserId(accessToken: string): Promise<string | null> {
    const session = await this.sessionModel
      .findOne({
        tokenHash: this.hashToken(accessToken),
        expiresAt: { $gt: new Date() },
      })
      .select('userId')
      .lean()
      .exec();
    return session?.userId ?? null;
  }

  async getUserProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản.');
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      elo: user.elo,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
    };
  }

  private async createSession(user: UserDocument) {
    const accessToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.sessionLifetimeMs);
    await this.sessionModel.create({
      tokenHash: this.hashToken(accessToken),
      userId: user.id,
      expiresAt,
    });
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        elo: user.elo,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
      },
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }

  private validateCredentials(
    username: string,
    email: string,
    password: string,
  ) {
    if (username.length < 2 || username.length > 20) {
      throw new BadRequestException('Tên người chơi phải từ 2 đến 20 ký tự.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Email không đúng định dạng.');
    }
    if (password.length < 4) {
      throw new BadRequestException('Mật khẩu phải từ 4 ký tự trở lên.');
    }
  }

  private hashPassword(password: string, salt: string): string {
    return scryptSync(password, salt, 64).toString('hex');
  }

  private passwordMatches(
    password: string,
    salt: string,
    expectedHash: string,
  ): boolean {
    const actual = Buffer.from(this.hashPassword(password, salt), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }
}
