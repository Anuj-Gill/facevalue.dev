import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';

export class CreateSuggestionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  @Matches(/^[A-Z0-9]+$/, { message: 'Coin name must be uppercase letters and numbers only' })
  coinName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  ceoName: string;
}

export class VoteDto {
  @IsEnum(['UP', 'DOWN'])
  voteType: 'UP' | 'DOWN';
}

export interface SuggestionResponse {
  id: string;
  coinName: string;
  ceoName: string;
  upvotes: number;
  downvotes: number;
  netVotes: number;
  userVote: 'UP' | 'DOWN' | null;
  createdAt: Date;
}
