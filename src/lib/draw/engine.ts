import { randomInt } from 'crypto';

/**
 * Draw Engine — generates winning numbers and matches against user scores.
 *
 * Draw Types:
 * - Random: standard lottery-style CSPRNG generation
 * - Algorithmic: weighted by score frequency analysis
 *
 * Match Types:
 * - 5-match: all 5 scores match (Jackpot) — 40% of pool
 * - 4-match: 4 of 5 scores match — 35% of pool
 * - 3-match: 3 of 5 scores match — 25% of pool
 */

const POOL_SPLIT = {
  '5-match': 0.4,
  '4-match': 0.35,
  '3-match': 0.25,
} as const;

export type MatchType = '5-match' | '4-match' | '3-match';

export interface DrawResult {
  winningNumbers: number[];
  entries: EntryResult[];
  poolBreakdown: {
    total: number;
    fiveMatch: number;
    fourMatch: number;
    threeMatch: number;
  };
  winners: {
    matchType: MatchType;
    userId: string;
    matchedCount: number;
    prizeAmount: number;
  }[];
}

export interface EntryResult {
  userId: string;
  scoresSnapshot: number[];
  matchedCount: number;
}

/** Generate 5 random winning numbers (1-45) using CSPRNG */
export function generateRandomNumbers(): number[] {
  const numbers: number[] = [];
  while (numbers.length < 5) {
    const n = randomInt(1, 46); // 1-45 inclusive
    if (!numbers.includes(n)) {
      numbers.push(n);
    }
  }
  return numbers.sort((a, b) => a - b);
}

/** Generate weighted numbers based on score frequency */
export function generateAlgorithmicNumbers(
  allScores: { score: number; count: number }[]
): number[] {
  if (allScores.length === 0) return generateRandomNumbers();

  // Build weighted pool — more frequent scores have higher weight
  const totalCount = allScores.reduce((sum, s) => sum + s.count, 0);
  const weightedPool: number[] = [];

  for (const { score, count } of allScores) {
    // Weight = frequency proportion * 100
    const weight = Math.max(1, Math.round((count / totalCount) * 100));
    for (let i = 0; i < weight; i++) {
      weightedPool.push(score);
    }
  }

  const numbers: number[] = [];
  while (numbers.length < 5) {
    const idx = randomInt(0, weightedPool.length);
    const n = weightedPool[idx];
    if (!numbers.includes(n)) {
      numbers.push(n);
    }
    // Prevent infinite loop if not enough unique scores
    if (weightedPool.length < 5 && numbers.length >= new Set(weightedPool).size) {
      // Fill remaining with random
      while (numbers.length < 5) {
        const r = randomInt(1, 46);
        if (!numbers.includes(r)) numbers.push(r);
      }
    }
  }

  return numbers.sort((a, b) => a - b);
}

/** Count how many numbers in userScores match winningNumbers (order-independent) */
export function countMatches(userScores: number[], winningNumbers: number[]): number {
  const winSet = new Set(winningNumbers);
  return userScores.filter((s) => winSet.has(s)).length;
}

/** Run the full draw: generate numbers, match entries, calculate prizes */
export function executeDraw(
  entries: { userId: string; scores: number[] }[],
  totalPoolAmount: number,
  drawType: 'random' | 'algorithmic',
  scoreFrequencies?: { score: number; count: number }[],
  previousJackpotRollover: number = 0
): DrawResult {
  // Generate winning numbers
  const winningNumbers =
    drawType === 'algorithmic' && scoreFrequencies
      ? generateAlgorithmicNumbers(scoreFrequencies)
      : generateRandomNumbers();

  // Match each entry
  const entryResults: EntryResult[] = entries.map((entry) => ({
    userId: entry.userId,
    scoresSnapshot: entry.scores,
    matchedCount: countMatches(entry.scores, winningNumbers),
  }));

  // Calculate pool breakdown
  const fiveMatchPool = Math.round(totalPoolAmount * POOL_SPLIT['5-match']) + previousJackpotRollover;
  const fourMatchPool = Math.round(totalPoolAmount * POOL_SPLIT['4-match']);
  const threeMatchPool = Math.round(totalPoolAmount * POOL_SPLIT['3-match']);

  // Find winners per tier
  const fiveMatchWinners = entryResults.filter((e) => e.matchedCount === 5);
  const fourMatchWinners = entryResults.filter((e) => e.matchedCount === 4);
  const threeMatchWinners = entryResults.filter((e) => e.matchedCount === 3);

  const winners: DrawResult['winners'] = [];

  // 5-match: split equally, rollover if no winners
  if (fiveMatchWinners.length > 0) {
    const perWinner = Math.floor(fiveMatchPool / fiveMatchWinners.length);
    fiveMatchWinners.forEach((w) => {
      winners.push({
        matchType: '5-match',
        userId: w.userId,
        matchedCount: 5,
        prizeAmount: perWinner,
      });
    });
  }

  // 4-match
  if (fourMatchWinners.length > 0) {
    const perWinner = Math.floor(fourMatchPool / fourMatchWinners.length);
    fourMatchWinners.forEach((w) => {
      winners.push({
        matchType: '4-match',
        userId: w.userId,
        matchedCount: 4,
        prizeAmount: perWinner,
      });
    });
  }

  // 3-match
  if (threeMatchWinners.length > 0) {
    const perWinner = Math.floor(threeMatchPool / threeMatchWinners.length);
    threeMatchWinners.forEach((w) => {
      winners.push({
        matchType: '3-match',
        userId: w.userId,
        matchedCount: 3,
        prizeAmount: perWinner,
      });
    });
  }

  return {
    winningNumbers,
    entries: entryResults,
    poolBreakdown: {
      total: totalPoolAmount,
      fiveMatch: fiveMatchPool,
      fourMatch: fourMatchPool,
      threeMatch: threeMatchPool,
    },
    winners,
  };
}
