export interface TeamRaw {
  team: string;
  wins: number;
  losses: number;
  points: number;
  totalScore: number;
  netScore: number;
  matches: number;
  epa?: string;
}

export interface TeamRanked extends TeamRaw {
  totalMatches: number;
  totalWinLossScore: number;
  epa: string;
  winRate: string;
}

export interface Alliance {
  number: number;
  name: string;
  team1: string;
  team2: string;
  team1EPA: string;
  team2EPA: string;
  totalEPA: string;
}

export interface PlayoffMatch {
  alliance1: Alliance;
  alliance2: Alliance;
  winner: Alliance | null;
  epaDiff: string;
}

export type SortField =
  | 'wins'
  | 'losses'
  | 'totalMatches'
  | 'winRate'
  | 'totalWinLossScore'
  | 'netScore'
  | 'totalScore'
  | 'epa';

export type SortOrder = 'asc' | 'desc';

export type NotificationType = 'success' | 'error' | 'info';

export type DataSource = 'sample' | 'kdocs' | 'url' | 'manual';

export type TabName = 'ranking' | 'playoff';
