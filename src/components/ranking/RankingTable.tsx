import type { TeamRanked, SortField, SortOrder } from '../../types';
import styles from './RankingTable.module.css';

interface Props {
  teams: TeamRanked[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  searchKeyword: string;
  featuredNames: string[];
  onTeamClick: (name: string) => void;
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'wins', label: '胜场' },
  { field: 'losses', label: '负场' },
  { field: 'totalMatches', label: '总场次' },
  { field: 'winRate', label: '胜率' },
  { field: 'totalWinLossScore', label: '胜负分' },
  { field: 'netScore', label: '净胜分' },
  { field: 'totalScore', label: '总分' },
  { field: 'epa', label: 'EPA' },
];

export function RankingTable({
  teams,
  sortField,
  sortOrder,
  onSort,
  searchKeyword,
  featuredNames,
  onTeamClick,
}: Props) {
  const filtered = searchKeyword
    ? teams.filter((t) => t.team.toLowerCase().includes(searchKeyword))
    : teams;

  return (
    <div className={styles.container}>
      {searchKeyword && (
        <div className={styles.searchResult}>
          {filtered.length > 0
            ? `找到 ${filtered.length} 支战队`
            : '未找到匹配的战队'}
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.rankCol}>排名</th>
            <th className={styles.teamCol}>队伍名称</th>
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                className={`${styles.numberCol} ${styles.sortable} ${sortField === col.field ? styles.active : ''}`}
                onClick={() => onSort(col.field)}
              >
                {col.label}{' '}
                <span className={styles.sortIcon}>
                  {sortField === col.field ? (sortOrder === 'desc' ? '▼' : '▲') : ''}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={10} className={styles.noData}>
                暂无数据，请点击"加载示例数据"
              </td>
            </tr>
          ) : (
            filtered.map((team) => {
              const rank = teams.indexOf(team) + 1;
              const rankClass =
                rank === 1 ? styles.rank1 : rank === 2 ? styles.rank2 : rank === 3 ? styles.rank3 : '';

              return (
                <tr key={team.team} className={rankClass}>
                  <td className={styles.rankCol}>{MEDAL[rank] || rank}</td>
                  <td
                    className={styles.teamClickable}
                    onClick={() => onTeamClick(team.team)}
                    title={
                      featuredNames.includes(team.team)
                        ? '点击取消关注'
                        : '点击添加到关注列表'
                    }
                  >
                    {team.team}
                    {featuredNames.includes(team.team) && (
                      <span className={styles.badge}>⭐</span>
                    )}
                  </td>
                  <td className={styles.numberCol}>{team.wins}</td>
                  <td className={styles.numberCol}>{team.losses}</td>
                  <td className={styles.numberCol}>{team.totalMatches}</td>
                  <td className={styles.numberCol}>{team.winRate}%</td>
                  <td className={styles.scoreCol}>
                    <strong>{team.totalWinLossScore}</strong>
                  </td>
                  <td
                    className={styles.numberCol}
                    style={{ color: team.netScore >= 0 ? '#28a745' : '#dc3545' }}
                  >
                    <strong>
                      {team.netScore > 0 ? '+' : ''}
                      {team.netScore}
                    </strong>
                  </td>
                  <td className={styles.numberCol}>{team.totalScore}</td>
                  <td className={styles.epaCol}>
                    <strong>{team.epa}</strong>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
