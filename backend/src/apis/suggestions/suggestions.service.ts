import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { CreateSuggestionDto, SuggestionResponse } from './suggestions.dto';

@Injectable()
export class SuggestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSuggestion(dto: CreateSuggestionDto, userId: string): Promise<SuggestionResponse> {
    // Check if user already has a suggestion
    const existingSuggestion = await this.prisma.coinSuggestion.findFirst({
      where: { userId },
    });

    if (existingSuggestion) {
      throw new ForbiddenException('You have already submitted a suggestion. Only one suggestion per user is allowed.');
    }

    // Check if coin name already exists
    const existingCoinName = await this.prisma.coinSuggestion.findUnique({
      where: { coinName: dto.coinName },
    });

    if (existingCoinName) {
      throw new ConflictException('A suggestion with this coin name already exists.');
    }

    // Check if CEO name already exists
    const existingCeoName = await this.prisma.coinSuggestion.findUnique({
      where: { ceoName: dto.ceoName },
    });

    if (existingCeoName) {
      throw new ConflictException('A suggestion for this CEO already exists.');
    }

    const suggestion = await this.prisma.coinSuggestion.create({
      data: {
        coinName: dto.coinName.toUpperCase(),
        ceoName: dto.ceoName,
        userId,
      },
    });

    return {
      id: suggestion.id,
      coinName: suggestion.coinName,
      ceoName: suggestion.ceoName,
      upvotes: 0,
      downvotes: 0,
      netVotes: 0,
      userVote: null,
      createdAt: suggestion.createdAt,
    };
  }

  async getAllSuggestions(userId: string): Promise<SuggestionResponse[]> {
    const suggestions = await this.prisma.coinSuggestion.findMany({
      include: {
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate votes and sort by net votes
    const suggestionsWithVotes = suggestions.map((suggestion) => {
      const upvotes = suggestion.votes.filter((v) => v.voteType === 'UP').length;
      const downvotes = suggestion.votes.filter((v) => v.voteType === 'DOWN').length;
      const userVote = suggestion.votes.find((v) => v.userId === userId)?.voteType || null;

      return {
        id: suggestion.id,
        coinName: suggestion.coinName,
        ceoName: suggestion.ceoName,
        upvotes,
        downvotes,
        netVotes: upvotes - downvotes,
        userVote,
        createdAt: suggestion.createdAt,
      };
    });

    // Sort by net votes (highest first)
    return suggestionsWithVotes.sort((a, b) => b.netVotes - a.netVotes);
  }

  async vote(suggestionId: string, userId: string, voteType: 'UP' | 'DOWN'): Promise<SuggestionResponse> {
    // Check if suggestion exists
    const suggestion = await this.prisma.coinSuggestion.findUnique({
      where: { id: suggestionId },
      include: { votes: true },
    });

    if (!suggestion) {
      throw new NotFoundException('Suggestion not found.');
    }

    // Check if user already voted
    const existingVote = await this.prisma.coinVote.findUnique({
      where: {
        suggestionId_userId: {
          suggestionId,
          userId,
        },
      },
    });

    if (existingVote) {
      throw new ForbiddenException('You have already voted on this suggestion. Votes cannot be changed.');
    }

    // Create the vote
    await this.prisma.coinVote.create({
      data: {
        suggestionId,
        userId,
        voteType,
      },
    });

    // Fetch updated suggestion
    const updatedSuggestion = await this.prisma.coinSuggestion.findUnique({
      where: { id: suggestionId },
      include: { votes: true },
    });

    const upvotes = updatedSuggestion.votes.filter((v) => v.voteType === 'UP').length;
    const downvotes = updatedSuggestion.votes.filter((v) => v.voteType === 'DOWN').length;

    return {
      id: updatedSuggestion.id,
      coinName: updatedSuggestion.coinName,
      ceoName: updatedSuggestion.ceoName,
      upvotes,
      downvotes,
      netVotes: upvotes - downvotes,
      userVote: voteType,
      createdAt: updatedSuggestion.createdAt,
    };
  }

  async hasUserSuggested(userId: string): Promise<boolean> {
    const suggestion = await this.prisma.coinSuggestion.findFirst({
      where: { userId },
    });
    return !!suggestion;
  }
}
