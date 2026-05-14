import type { Item } from './types';
import { daysBetween, tokenize } from './utils';
import type { MatchResult } from './types';

/**
 * Score a single lost–found pair on a scale of 0–100.
 * Returns null if score < 45 (not a relevant match).
 */
export function scorePair(lost: Item, found: Item): MatchResult | null {
  if (lost.type !== 'lost' || found.type !== 'found') return null;

  let score = 0;
  const reasons: string[] = [];

  // 1. Category match (+30)
  if (lost.category.toLowerCase() === found.category.toLowerCase()) {
    score += 30;
    reasons.push(`Same category: ${lost.category}`);
  }

  // 2. Location similarity (+20)
  const lostLoc  = lost.location.toLowerCase();
  const foundLoc = found.location.toLowerCase();
  const locWords = new Set([...lostLoc.split(/\s+/), ...foundLoc.split(/\s+/)]);

  const lostLocTokens  = new Set(lostLoc.split(/\s+/).filter((w) => w.length > 2));
  const foundLocTokens = new Set(foundLoc.split(/\s+/).filter((w) => w.length > 2));
  const sharedLoc = [...lostLocTokens].filter((w) => foundLocTokens.has(w));

  if (sharedLoc.length > 0) {
    score += 20;
    reasons.push(`Both mention "${sharedLoc[0]}"`);
  } else if (
    lostLoc.includes(foundLoc.substring(0, 4)) ||
    foundLoc.includes(lostLoc.substring(0, 4))
  ) {
    score += 10;
    reasons.push('Similar location area');
  }

  void locWords; // suppress unused warning

  // 3. Date closeness (up to +20)
  const days = daysBetween(lost.date, found.date);
  if (days === 0) {
    score += 20;
    reasons.push('Same date');
  } else if (days <= 2) {
    score += 12;
    reasons.push(`Dates are within ${days} day${days > 1 ? 's' : ''}`);
  } else if (days <= 7) {
    score += 6;
    reasons.push(`Dates within a week`);
  }

  // 4. Title + description keyword overlap (+20)
  const lostTokens  = new Set([...tokenize(lost.title),  ...tokenize(lost.description)]);
  const foundTokens = new Set([...tokenize(found.title), ...tokenize(found.description)]);
  const shared = [...lostTokens].filter((t) => foundTokens.has(t));

  if (shared.length >= 3) {
    score += 20;
    reasons.push(`Shared keywords: ${shared.slice(0, 3).join(', ')}`);
  } else if (shared.length >= 1) {
    score += 10;
    reasons.push(`Shared keyword: ${shared[0]}`);
  }

  // 5. Color match (+5)
  if (
    lost.color &&
    found.color &&
    lost.color.toLowerCase() === found.color.toLowerCase()
  ) {
    score += 5;
    reasons.push(`Same color: ${lost.color}`);
  }

  // 6. Brand match (+5)
  if (
    lost.brand &&
    found.brand &&
    lost.brand.toLowerCase() === found.brand.toLowerCase()
  ) {
    score += 5;
    reasons.push(`Same brand: ${lost.brand}`);
  }

  if (score < 45) return null;

  return { lostItem: lost, foundItem: found, score: Math.min(score, 100), reasons };
}

/** Run all lost×found pairings and return matches sorted by score desc. */
export function getMatches(items: Item[]): MatchResult[] {
  const lostItems  = items.filter((i) => i.type === 'lost');
  const foundItems = items.filter((i) => i.type === 'found');

  const results: MatchResult[] = [];

  for (const lost of lostItems) {
    for (const found of foundItems) {
      const result = scorePair(lost, found);
      if (result) results.push(result);
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
