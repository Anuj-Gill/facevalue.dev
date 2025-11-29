import api from './axios';

export interface Suggestion {
  id: string;
  coinName: string;
  ceoName: string;
  upvotes: number;
  downvotes: number;
  netVotes: number;
  userVote: 'UP' | 'DOWN' | null;
  createdAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedSuggestionsResponse {
  data: Suggestion[];
  pagination: PaginationInfo;
}

export interface CreateSuggestionPayload {
  coinName: string;
  ceoName: string;
}

export interface VotePayload {
  voteType: 'UP' | 'DOWN';
}

export const suggestionsApi = {
  // Get all suggestions (sorted by votes) with pagination
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedSuggestionsResponse> => {
    const response = await api.get(`/suggestions?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create a new suggestion
  create: async (payload: CreateSuggestionPayload): Promise<Suggestion> => {
    const response = await api.post('/suggestions', payload);
    return response.data.data;
  },

  // Vote on a suggestion
  vote: async (suggestionId: string, payload: VotePayload): Promise<Suggestion> => {
    const response = await api.post(`/suggestions/${suggestionId}/vote`, payload);
    return response.data.data;
  },

  // Check if user has already suggested
  hasSuggested: async (): Promise<boolean> => {
    const response = await api.get('/suggestions/has-suggested');
    return response.data.hasSuggested;
  },
};

export default suggestionsApi;
