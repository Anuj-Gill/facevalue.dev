'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useSuggestionsStore } from '@/stores';
import { toast } from 'sonner';
import {
  Trophy,
  ThumbsUp,
  ThumbsDown,
  Plus,
  X,
  Sparkles,
  Crown,
  Medal,
  Users,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';

export default function SuggestionsPage() {
  const {
    suggestions,
    isLoading,
    error,
    hasSuggested,
    fetchSuggestions,
    createSuggestion,
    vote,
    checkHasSuggested,
    clearError,
  } = useSuggestionsStore();

  const [showModal, setShowModal] = useState(false);
  const [coinName, setCoinName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSuggestions();
    checkHasSuggested();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim() || !ceoName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSuggestion(coinName.toUpperCase(), ceoName);
      toast.success('Suggestion submitted successfully! 🎉');
      setShowModal(false);
      setCoinName('');
      setCeoName('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit suggestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (suggestionId: string, voteType: 'UP' | 'DOWN') => {
    try {
      await vote(suggestionId, voteType);
      toast.success(voteType === 'UP' ? 'Upvoted! 👍' : 'Downvoted! 👎');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to vote');
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="size-5 text-amber-400" />;
    if (index === 1) return <Medal className="size-5 text-gray-400" />;
    if (index === 2) return <Medal className="size-5 text-amber-700" />;
    return <span className="text-sm font-bold text-gray-500">#{index + 1}</span>;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30';
    if (index === 1) return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-500/30';
    if (index === 2) return 'bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-700/30';
    return 'bg-white/5 border-white/10';
  };

  return (
    <div className="container mx-auto p-6 mt-24">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30">
          <Trophy className="size-8 text-orange-400" />
        </div>
        <h1 className="text-4xl font-bold mb-3 text-white">
          Choose Your Next CEO Coin
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto mb-6">
          Suggest and vote for the next CEO to join the MemeExchange platform. The most upvoted suggestion will be added!
        </p>

        {/* Add Suggestion Button */}
        <Button
          onClick={() => setShowModal(true)}
          disabled={hasSuggested}
          className={`${
            hasSuggested
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
          } text-white font-semibold px-6 py-3 rounded-xl`}
        >
          <Plus className="size-4 mr-2" />
          {hasSuggested ? 'Already Suggested' : 'Suggest a CEO Coin'}
        </Button>
        {hasSuggested && (
          <p className="text-xs text-gray-500 mt-2">You can only submit one suggestion</p>
        )}
      </div>

      {/* Winner Banner */}
      <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-500/20 rounded-2xl mb-8">
        <CardContent className="py-4 px-6">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="size-5 text-amber-400" />
            <p className="text-sm font-medium text-amber-400">
              🏆 The most upvoted suggestion will be added to the platform!
            </p>
            <Sparkles className="size-5 text-amber-400" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-white/10 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <Lightbulb className="size-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{suggestions.length}</p>
              <p className="text-xs text-gray-500">Total Suggestions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <ThumbsUp className="size-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {suggestions.reduce((acc, s) => acc + s.upvotes, 0)}
              </p>
              <p className="text-xs text-gray-500">Total Upvotes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Users className="size-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {suggestions.reduce((acc, s) => acc + s.upvotes + s.downvotes, 0)}
              </p>
              <p className="text-xs text-gray-500">Total Votes Cast</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="bg-card border-white/10 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="size-5 text-orange-400" />
                Leaderboard
              </CardTitle>
              <CardDescription className="text-gray-500">
                Top voted CEO coin suggestions
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              disabled={hasSuggested}
              size="sm"
              className={`${
                hasSuggested
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white`}
            >
              <Plus className="size-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">No suggestions yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Be the first to suggest a CEO coin for the platform!
              </p>
              <Button
                onClick={() => setShowModal(true)}
                disabled={hasSuggested}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="size-4 mr-2" />
                Make First Suggestion
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`p-4 sm:p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors ${
                    index === 0 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${getRankBadge(
                      index
                    )}`}
                  >
                    {getRankIcon(index)}
                  </div>

                  {/* CEO Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* CEO Initials Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center ring-2 ring-orange-500/20">
                        <span className="font-bold text-sm text-orange-400">
                          {suggestion.ceoName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{suggestion.ceoName}</h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-orange-500/30 text-orange-400 text-xs"
                          >
                            {suggestion.coinName}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vote Count */}
                  <div className="text-center px-4">
                    <p
                      className={`text-xl font-bold ${
                        suggestion.netVotes > 0
                          ? 'text-emerald-400'
                          : suggestion.netVotes < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {suggestion.netVotes > 0 ? '+' : ''}
                      {suggestion.netVotes}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Score</p>
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(suggestion.id, 'UP')}
                      disabled={suggestion.userVote !== null}
                      className={`p-2.5 rounded-xl transition-all ${
                        suggestion.userVote === 'UP'
                          ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                          : suggestion.userVote === 'DOWN'
                          ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                          : 'bg-white/5 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                      }`}
                    >
                      <ThumbsUp className="size-4" />
                    </button>
                    <button
                      onClick={() => handleVote(suggestion.id, 'DOWN')}
                      disabled={suggestion.userVote !== null}
                      className={`p-2.5 rounded-xl transition-all ${
                        suggestion.userVote === 'DOWN'
                          ? 'bg-red-500/20 text-red-400 cursor-default'
                          : suggestion.userVote === 'UP'
                          ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                          : 'bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                      }`}
                    >
                      <ThumbsDown className="size-4" />
                    </button>
                  </div>

                  {/* Vote Breakdown - Hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="size-3 text-emerald-400" />
                      {suggestion.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="size-3 text-red-400" />
                      {suggestion.downvotes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestion Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-card border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 mb-3 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                <Sparkles className="size-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Suggest a CEO Coin</h3>
              <p className="text-sm text-gray-500 mt-1">
                Which CEO should join the MemeExchange?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Coin Name
                </label>
                <Input
                  placeholder="e.g., MEME3"
                  value={coinName}
                  onChange={(e) => setCoinName(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500"
                />
                <p className="text-[10px] text-gray-600 mt-1">
                  Uppercase letters and numbers only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  CEO Name
                </label>
                <Input
                  placeholder="e.g., Mark Zuckerberg"
                  value={ceoName}
                  onChange={(e) => setCeoName(e.target.value)}
                  maxLength={50}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-400">
                  ⚠️ You can only submit one suggestion. Make it count!
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !coinName.trim() || !ceoName.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Suggestion 🚀'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
