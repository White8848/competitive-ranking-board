import type { TabName } from '../../types';
import styles from './TabNavigation.module.css';

interface Props {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs: { key: TabName; label: string }[] = [
  { key: 'ranking', label: '📊 排行榜' },
  { key: 'playoff', label: '🏆 淘汰赛预测' },
];

export function TabNavigation({ activeTab, onTabChange }: Props) {
  return (
    <div className={styles.nav}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.btn} ${activeTab === tab.key ? styles.active : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
