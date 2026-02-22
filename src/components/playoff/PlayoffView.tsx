import { useState } from 'react';
import type { TeamRaw, PlayoffMatch } from '../../types';
import { parseAllianceData, generatePlayoffRounds } from '../../utils/playoffGenerator';
import styles from './PlayoffView.module.css';

interface Props {
  teamsData: TeamRaw[];
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function PlayoffView({ teamsData, showNotification }: Props) {
  const [input, setInput] = useState('');
  const [rounds, setRounds] = useState<PlayoffMatch[][] | null>(null);

  const handleGenerate = () => {
    if (!input.trim()) {
      showNotification('请先粘贴联盟选择表格数据', 'error');
      return;
    }
    if (teamsData.length === 0) {
      showNotification('请先加载战队排名数据', 'error');
      return;
    }

    try {
      const alliances = parseAllianceData(input, teamsData);
      if (alliances.length === 0) {
        showNotification('未能解析到联盟数据', 'error');
        return;
      }
      const result = generatePlayoffRounds(alliances);
      setRounds(result);
      showNotification(`成功生成 ${alliances.length} 个联盟的淘汰赛赛程`, 'success');
    } catch (error) {
      showNotification('解析联盟数据错误: ' + (error as Error).message, 'error');
    }
  };

  const champion =
    rounds && rounds.length > 0
      ? (rounds[rounds.length - 1][0].winner ?? rounds[rounds.length - 1][0].alliance1)
      : null;

  return (
    <div className={styles.container}>
      <h2>🏆 淘汰赛预测系统</h2>

      <div className={styles.inputSection}>
        <h3>📋 输入联盟选择表格</h3>
        <p className={styles.hint}>粘贴从表格复制的联盟选择数据（包括标题行）</p>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`联盟编号\t联盟编号\t排名\t战队编号\t战队名称\t排名\t战队编号\t战队名称\n1\t联盟1\t1\tX228841\t白狼\t24\tX228709\t渊图`}
        />
        <button className={styles.generateBtn} onClick={handleGenerate}>
          🛠️ 生成淘汰赛赛程
        </button>
      </div>

      {rounds && (
        <div className={styles.result}>
          <h3>🎯 淘汰赛赛程及预测结果</h3>
          <div className={styles.bracket}>
            {rounds.map((round, roundIdx) => (
              <div
                key={roundIdx}
                className={`${styles.round} ${roundIdx === rounds.length - 1 ? styles.championRound : ''}`}
              >
                <h4 className={styles.roundTitle}>
                  {roundIdx === rounds.length - 1 ? '🏆 冠军' : `第${roundIdx + 1}轮`}
                </h4>
                <div className={styles.roundMatches}>
                  {round.map((match, matchIdx) => (
                    <div key={matchIdx} className={styles.match}>
                      <div
                        className={`${styles.team} ${match.winner === match.alliance1 ? styles.winner : ''}`}
                      >
                        <div className={styles.teamSlot}>
                          <span className={styles.seed}>{match.alliance1.number}</span>
                          <div className={styles.details}>
                            <div className={styles.teamName}>{match.alliance1.name}</div>
                            <div className={styles.members}>
                              {match.alliance1.team1} &amp; {match.alliance1.team2}
                            </div>
                          </div>
                          <span className={styles.score}>{match.alliance1.totalEPA}</span>
                        </div>
                      </div>
                      <div
                        className={`${styles.team} ${match.winner === match.alliance2 ? styles.winner : ''}`}
                      >
                        <div className={styles.teamSlot}>
                          <span className={styles.seed}>{match.alliance2.number}</span>
                          <div className={styles.details}>
                            <div className={styles.teamName}>{match.alliance2.name}</div>
                            <div className={styles.members}>
                              {match.alliance2.team1} &amp; {match.alliance2.team2}
                            </div>
                          </div>
                          <span className={styles.score}>{match.alliance2.totalEPA}</span>
                        </div>
                      </div>
                      {!match.winner && <div className={styles.matchNote}>⚖️ 势均力敌</div>}
                    </div>
                  ))}

                  {roundIdx === rounds.length - 1 && champion && (
                    <div className={styles.championCard}>
                      <div className={styles.trophy}>🏆</div>
                      <div className={styles.championName}>{champion.name}</div>
                      <div className={styles.championTeams}>
                        {champion.team1} &amp; {champion.team2}
                      </div>
                      <div className={styles.championEpa}>总EPA: {champion.totalEPA}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
