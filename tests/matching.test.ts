import { describe, it, expect } from 'vitest';
import { scorePair, getMatches } from '../lib/matching';
import type { Item } from '../lib/types';

function makeItem(overrides: Partial<Item>): Item {
  return {
    id:                  overrides.id ?? 'test-id',
    type:                overrides.type ?? 'lost',
    title:               overrides.title ?? 'Test item',
    category:            overrides.category ?? 'Other',
    description:         overrides.description ?? 'A test item',
    location:            overrides.location ?? 'Campus',
    date:                overrides.date ?? '2026-05-10',
    image_url:           overrides.image_url ?? null,
    color:               overrides.color,
    brand:               overrides.brand,
    identifying_details: overrides.identifying_details,
    contact_name:        overrides.contact_name ?? 'Test User',
    contact_email:       overrides.contact_email ?? 'test@example.com',
    posted_by_user_id:   overrides.posted_by_user_id ?? null,
    posted_by_name:      overrides.posted_by_name ?? 'Test User',
    status:              overrides.status ?? 'open',
    created_at:          overrides.created_at ?? '2026-05-10T10:00:00Z',
  };
}

describe('scorePair', () => {
  it('returns a high score for a clear wallet + library match', () => {
    const lost = makeItem({
      type:        'lost',
      title:       'Black leather wallet',
      category:    'Wallet',
      description: 'Lost my black leather wallet near the library. Has student ID inside.',
      location:    'Central Library, 2nd Floor',
      date:        '2026-05-10',
      color:       'Black',
    });
    const found = makeItem({
      id:          'found-id',
      type:        'found',
      title:       'Found black wallet near library entrance',
      category:    'Wallet',
      description: 'Found a black bifold wallet near the library. Has some cards inside.',
      location:    'Central Library, Entrance',
      date:        '2026-05-10',
      color:       'Black',
    });

    const result = scorePair(lost, found);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(70);
    expect(result!.reasons.length).toBeGreaterThan(0);
  });

  it('returns a high score for matching AirPods in the same lecture hall', () => {
    const lost = makeItem({
      type:        'lost',
      title:       'AirPods Pro case',
      category:    'Earbuds / Headphones',
      description: 'Lost white AirPods Pro charging case in lecture hall',
      location:    'Lecture Hall B-204',
      date:        '2026-05-12',
      color:       'White',
      brand:       'Apple',
    });
    const found = makeItem({
      id:          'found-id-2',
      type:        'found',
      title:       'Found earbuds case in lecture hall',
      category:    'Earbuds / Headphones',
      description: 'Found a white earbuds charging case under a seat in lecture hall',
      location:    'Lecture Hall B-204',
      date:        '2026-05-12',
      color:       'White',
      brand:       'Apple',
    });

    const result = scorePair(lost, found);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(80);
    expect(result!.reasons).toContain('Same brand: Apple');
  });

  it('returns null for unrelated items (different category, location, date)', () => {
    const lost = makeItem({
      type:        'lost',
      title:       'Blue water bottle',
      category:    'Water Bottle',
      description: 'Lost my blue water bottle near the sports complex',
      location:    'Sports Complex',
      date:        '2026-05-01',
      color:       'Blue',
    });
    const found = makeItem({
      id:          'found-id-3',
      type:        'found',
      title:       'Found Casio calculator',
      category:    'Stationery',
      description: 'Found a black Casio calculator in the engineering block',
      location:    'Engineering Block, Room 101',
      date:        '2026-05-10',
      color:       'Black',
      brand:       'Casio',
    });

    const result = scorePair(lost, found);
    expect(result).toBeNull();
  });

  it('returns null when types are wrong (lost vs lost)', () => {
    const lostA = makeItem({ type: 'lost', category: 'Wallet', id: 'a' });
    const lostB = makeItem({ type: 'lost', category: 'Wallet', id: 'b' });
    const result = scorePair(lostA, lostB);
    expect(result).toBeNull();
  });

  it('getMatches returns results sorted by score descending', () => {
    const items: Item[] = [
      makeItem({ id: 'l1', type: 'lost',  category: 'Wallet', title: 'black wallet', description: 'lost black wallet library', location: 'library', date: '2026-05-10', color: 'Black' }),
      makeItem({ id: 'f1', type: 'found', category: 'Wallet', title: 'found wallet', description: 'found black wallet library', location: 'library', date: '2026-05-10', color: 'Black' }),
      makeItem({ id: 'l2', type: 'lost',  category: 'Keys',   title: 'lost keys',   description: 'lost keys parking',          location: 'parking', date: '2026-05-08' }),
      makeItem({ id: 'f2', type: 'found', category: 'Keys',   title: 'found keys',  description: 'found keys parking',         location: 'parking', date: '2026-05-08' }),
    ];
    const matches = getMatches(items);
    expect(matches.length).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i].score).toBeGreaterThanOrEqual(matches[i + 1].score);
    }
  });
});
