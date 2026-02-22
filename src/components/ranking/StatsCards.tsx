import type { TeamRanked } from '../../types';
import styles from './StatsCards.module.css';

interface Props {
  teams: TeamRanked[];
}

export function StatsCards({ teams }: Props) {
  const totalTeams = teams.length;
  const totalMatches = teams.reduce((sum, t) => sum + t.totalMatches, 0);
  const avgScore =
    totalTeams > 0
      ? (teams.reduce((sum, t) => sum + t.totalWinLossScore, 0) / totalTeams).toFixed(1)
      : '0';

  return (
    <div className={styles.summary}>
      <div className={styles.card}>
        <div className={styles.value}>{totalTeams}</div>
        <div className={styles.label}>参赛队伍</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{totalMatches}</div>
        <div className={styles.label}>总比赛场次</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{avgScore}</div>
        <div className={styles.label}>平均积分</div>
      </div>
    </div>
  );
}
