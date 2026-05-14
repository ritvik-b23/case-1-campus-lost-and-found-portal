import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ItemStatus, ItemType } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(isoStr: string): string {
  return new Date(isoStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: ItemStatus): string {
  switch (status) {
    case 'open':          return 'bg-green-100 text-green-800';
    case 'claim_pending': return 'bg-yellow-100 text-yellow-800';
    case 'resolved':      return 'bg-gray-200 text-gray-600';
    default:              return 'bg-gray-100 text-gray-700';
  }
}

export function getTypeColor(type: ItemType): string {
  return type === 'lost'
    ? 'bg-red-100 text-red-700'
    : 'bg-teal-100 text-teal-700';
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    'Wallet':                '👛',
    'ID Card':               '🪪',
    'Keys':                  '🔑',
    'Electronics':           '💻',
    'Earbuds / Headphones':  '🎧',
    'Water Bottle':          '💧',
    'Bag / Backpack':        '🎒',
    'Stationery':            '✏️',
    'Clothing':              '👕',
    'Jewellery':             '💍',
    'Books / Notebooks':     '📓',
    'Other':                 '📦',
  };
  return map[category] ?? '📦';
}

/** Generate a category-coloured SVG placeholder as a data URL */
export function getCategoryPlaceholder(category: string): string {
  const colours: Record<string, [string, string]> = {
    'Wallet':                ['#f59e0b', '#fef3c7'],
    'ID Card':               ['#6366f1', '#eef2ff'],
    'Keys':                  ['#f97316', '#fff7ed'],
    'Electronics':           ['#3b82f6', '#eff6ff'],
    'Earbuds / Headphones':  ['#8b5cf6', '#f5f3ff'],
    'Water Bottle':          ['#14b8a6', '#f0fdfa'],
    'Bag / Backpack':        ['#10b981', '#ecfdf5'],
    'Stationery':            ['#ec4899', '#fdf2f8'],
    'Clothing':              ['#0ea5e9', '#f0f9ff'],
    'Jewellery':             ['#d946ef', '#fdf4ff'],
    'Books / Notebooks':     ['#84cc16', '#f7fee7'],
    'Other':                 ['#94a3b8', '#f1f5f9'],
  };
  const [stroke, fill] = colours[category] ?? ['#94a3b8', '#f1f5f9'];
  const icon = getCategoryIcon(category);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="${fill}"/>
    <text x="200" y="140" font-size="72" text-anchor="middle" dominant-baseline="middle" fill="${stroke}">${icon}</text>
    <text x="200" y="210" font-size="18" text-anchor="middle" fill="${stroke}" font-family="sans-serif">${category}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function daysBetween(a: string, b: string): number {
  const msA = new Date(a).getTime();
  const msB = new Date(b).getTime();
  return Math.abs(Math.round((msA - msB) / (1000 * 60 * 60 * 24)));
}

export function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );
}
