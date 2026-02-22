import type { TeamRaw } from '../types';

export function parseTableData(text: string): TeamRaw[] {
  const lines = text.split('\n').filter((line) => line.trim());
  const teamMap = new Map<string, TeamRaw>();

  const getOrCreate = (name: string): TeamRaw => {
    if (!teamMap.has(name)) {
      teamMap.set(name, {
        team: name,
        wins: 0,
        losses: 0,
        points: 0,
        totalScore: 0,
        netScore: 0,
        matches: 0,
      });
    }
    return teamMap.get(name)!;
  };

  // Skip first line (header)
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/\t/).map((p) => p.trim());
    if (parts.length < 16) continue;

    const redTeam1Name = parts[3];
    const redTeam2Name = parts[5];
    const blueTeam1Name = parts[7];
    const blueTeam2Name = parts[9];

    const redWinLossScore = parseInt(parts[10]) || 0;
    const redTotalScore = parseInt(parts[11]) || 0;
    const redNetScore = parseInt(parts[12]) || 0;
    const blueWinLossScore = parseInt(parts[13]) || 0;
    const blueTotalScore = parseInt(parts[14]) || 0;
    const blueNetScore = parseInt(parts[15]) || 0;

    const updateTeam = (
      name: string,
      winLoss: number,
      total: number,
      net: number,
      opponentWinLoss: number,
    ) => {
      if (!name) return;
      const team = getOrCreate(name);
      team.points += winLoss;
      team.totalScore += total;
      team.netScore += net;
      team.matches += 1;
      if (winLoss > opponentWinLoss) team.wins += 1;
      else if (winLoss < opponentWinLoss) team.losses += 1;
    };

    updateTeam(redTeam1Name, redWinLossScore, redTotalScore, redNetScore, blueWinLossScore);
    updateTeam(redTeam2Name, redWinLossScore, redTotalScore, redNetScore, blueWinLossScore);
    updateTeam(blueTeam1Name, blueWinLossScore, blueTotalScore, blueNetScore, redWinLossScore);
    updateTeam(blueTeam2Name, blueWinLossScore, blueTotalScore, blueNetScore, redWinLossScore);
  }

  return Array.from(teamMap.values());
}

export function parseCSVData(csvText: string): TeamRaw[] {
  const lines = csvText.split('\n');
  const teams: TeamRaw[] = [];

  lines.forEach((line) => {
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length >= 4) {
      teams.push({
        team: parts[0],
        wins: parseInt(parts[1]) || 0,
        losses: parseInt(parts[2]) || 0,
        points: parseInt(parts[3]) || 0,
        totalScore: 0,
        netScore: 0,
        matches: 0,
      });
    }
  });

  return teams;
}

export function parseCSVFileContent(content: string): TeamRaw[] {
  const lines = content.split('\n').filter((line) => line.trim());
  const teams: TeamRaw[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length >= 4) {
      teams.push({
        team: parts[0],
        wins: parseInt(parts[1]) || 0,
        losses: parseInt(parts[2]) || 0,
        points: parseInt(parts[3]) || 0,
        totalScore: 0,
        netScore: 0,
        matches: 0,
      });
    }
  }

  return teams;
}
