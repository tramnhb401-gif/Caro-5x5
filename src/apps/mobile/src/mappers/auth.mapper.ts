// src/apps/mobile/src/mappers/auth.mapper.ts
import { UserProfile } from '@caro/shared';
import { UserProfileDto } from '../types/auth.dto';

export function mapUserProfileDtoToDomain(dto: UserProfileDto): UserProfile {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    elo: dto.elo,
    wins: dto.wins,
    losses: dto.losses,
    draws: dto.draws,
  };
}
