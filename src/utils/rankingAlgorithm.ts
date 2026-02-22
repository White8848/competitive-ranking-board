import type { TeamRaw, TeamRanked, SortField, SortOrder } from '../types';

export function calculateRanking(teams: TeamRaw[]): TeamRanked[] {
  return teams.map((team) => {
    const epaValue = team.matches > 0 ? (team.totalScore / team.matches / 2).toFixed(2) : '0.00';
    return {
      ...team,
      totalMatches: team.wins + team.losses,
      totalWinLossScore: team.points,
      epa: epaValue,
      winRate:
        team.wins + team.losses > 0
          ? ((team.wins / (team.wins + team.losses)) * 100).toFixed(1)
          : '0.0',
    };
  });
}

export function sortTeams(
  teams: TeamRanked[],
  sortField: SortField,
  sortOrder: SortOrder,
): TeamRanked[] {
  return [...teams].sort((a, b) => {
    let aValue: number = getFieldValue(a, sortField);
    let bValue: number = getFieldValue(b, sortField);

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;

    // Tiebreakers: winLossScore -> netScore -> wins -> totalScore
    if (sortField !== 'totalWinLossScore' && b.totalWinLossScore !== a.totalWinLossScore) {
      return b.totalWinLossScore - a.totalWinLossScore;
    }
    if (sortField !== 'netScore' && b.netScore !== a.netScore) {
      return b.netScore - a.netScore;
    }
    if (sortField !== 'wins' && b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.totalScore - a.totalScore;
  });
}

function getFieldValue(team: TeamRanked, field: SortField): number {
  const val = team[field];
  if (typeof val === 'string') return parseFloat(val) || 0;
  return val as number;
}
