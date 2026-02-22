import type { DataSource } from '../../types';
import styles from './DataControls.module.css';

interface Props {
  dataSource: DataSource;
  onDataSourceChange: (source: DataSource) => void;
  onLoadSample: () => void;
  onLoadKDocs: () => void;
  onQuickRead: () => void;
  onRefresh: () => void;
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number;
  onAutoRefreshToggle: (enabled: boolean) => void;
  onIntervalChange: (interval: number) => void;
}

export function DataControls({
  dataSource,
  onDataSourceChange,
  onLoadSample,
  onLoadKDocs,
  onQuickRead,
  onRefresh,
  autoRefreshEnabled,
  autoRefreshInterval,
  onAutoRefreshToggle,
  onIntervalChange,
}: Props) {
  return (
    <div className={styles.controls}>
      <button className={`${styles.btn} ${styles.primary}`} onClick={onLoadSample}>
        加载示例数据
      </button>
      <button className={`${styles.btn} ${styles.kdocs}`} onClick={onLoadKDocs}>
        📊 从金山文档加载
      </button>
      <button className={`${styles.btn} ${styles.success}`} onClick={onQuickRead}>
        ⚡ 快速读取剪贴板
      </button>
      <button className={`${styles.btn} ${styles.secondary}`} onClick={onRefresh}>
        刷新排名
      </button>

      <div className={styles.autoRefresh}>
        <label>
          <input
            type="checkbox"
            checked={autoRefreshEnabled}
            onChange={(e) => onAutoRefreshToggle(e.target.checked)}
          />
          自动刷新
        </label>
        <select
          value={autoRefreshInterval}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
        >
          <option value={10}>10秒</option>
          <option value={30}>30秒</option>
          <option value={60}>1分钟</option>
          <option value={120}>2分钟</option>
          <option value={300}>5分钟</option>
        </select>
      </div>

      <div className={styles.dataSource}>
        <label>数据来源:</label>
        <select
          value={dataSource}
          onChange={(e) => onDataSourceChange(e.target.value as DataSource)}
        >
          <option value="sample">示例数据</option>
          <option value="kdocs">金山文档</option>
          <option value="manual">手动输入</option>
        </select>
      </div>
    </div>
  );
}
