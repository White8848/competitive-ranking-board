import type { Alliance, PlayoffMatch, TeamRaw } from '../types';

export function parseAllianceData(text: string, teamsData: TeamRaw[]): Alliance[] {
  const lines = text.split('\n').filter((line) => line.trim());
  const alliances: Alliance[] = [];

  // Skip first two header lines
  for (let i = 2; i < lines.length; i++) {
    const parts = lines[i].split(/\t/).map((p) => p.trim());
    if (parts.length < 8) continue;

    const allianceNum = parseInt(parts[0]) || alliances.length + 1;
    const allianceName = parts[1];
    const team1Name = parts[4];
    const team2Name = parts[7];

    const team1Data = teamsData.find((t) => t.team === team1Name);
    const team2Data = teamsData.find((t) => t.team === team2Name);

    const team1EPA = team1Data?.epa ? parseFloat(team1Data.epa) : 0;
    const team2EPA = team2Data?.epa ? parseFloat(team2Data.epa) : 0;
    const totalEPA = team1EPA + team2EPA;

    alliances.push({
      number: allianceNum,
      name: allianceName,
      team1: team1Name,
      team2: team2Name,
      team1EPA: team1EPA.toFixed(2),
      team2EPA: team2EPA.toFixed(2),
      totalEPA: totalEPA.toFixed(2),
    });
  }

  return alliances;
}

export function generatePlayoffRounds(alliances: Alliance[]): PlayoffMatch[][] {
  function buildRound(teams: Alliance[]): PlayoffMatch[] {
    const round: PlayoffMatch[] = [];
    for (let i = 0; i < Math.floor(teams.length / 2); i++) {
      const a1 = teams[i];
      const a2 = teams[teams.length - 1 - i];
      const epa1 = parseFloat(a1.totalEPA);
      const epa2 = parseFloat(a2.totalEPA);
      const winner = epa1 > epa2 ? a1 : epa1 < epa2 ? a2 : null;
      round.push({
        alliance1: a1,
        alliance2: a2,
        winner,
        epaDiff: Math.abs(epa1 - epa2).toFixed(2),
      });
    }
    return round;
  }

  const rounds: PlayoffMatch[][] = [];
  let currentTeams = alliances;

  while (currentTeams.length > 1) {
    const round = buildRound(currentTeams);
    rounds.push(round);
    currentTeams = round.map((m) => m.winner ?? m.alliance1);
  }

  return rounds;
}
