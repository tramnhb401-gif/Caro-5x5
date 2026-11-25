export interface UserProfileDto {
  id: string;
  username: string;
  email: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserProfileDto;
}
