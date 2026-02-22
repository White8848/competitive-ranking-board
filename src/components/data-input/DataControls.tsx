import { useState } from 'react';
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
  kdocsUrl: string;
  onKDocsUrlChange: (url: string) => void;
  onFetchFromUrl: () => void;
  isFetching: boolean;
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
  kdocsUrl,
  onKDocsUrlChange,
  onFetchFromUrl,
  isFetching,
}: Props) {
  const [showUrlInput, setShowUrlInput] = useState(!!kdocsUrl);

  return (
    <div className={styles.controls}>
      <div className={styles.topRow}>
        <div className={styles.sourceSelect}>
          <label className={styles.sourceLabel}>数据来源</label>
          <select
            value={dataSource}
            onChange={(e) => onDataSourceChange(e.target.value as DataSource)}
            className={styles.select}
          >
            <option value="url">金山文档链接</option>
            <option value="kdocs">剪贴板粘贴</option>
            <option value="sample">示例数据</option>
            <option value="manual">手动输入</option>
          </select>
        </div>

        <div className={styles.actions}>
          {dataSource === 'url' && (
            <button
              className={`${styles.btn} ${styles.urlBtn}`}
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              {showUrlInput ? '收起链接' : '设置链接'}
            </button>
          )}
          <button className={`${styles.btn} ${styles.sampleBtn}`} onClick={onLoadSample}>
            示例数据
          </button>
          {dataSource === 'kdocs' && (
            <button className={`${styles.btn} ${styles.clipboardBtn}`} onClick={onQuickRead}>
              读取剪贴板
            </button>
          )}
          {dataSource === 'kdocs' && (
            <button className={`${styles.btn} ${styles.kdocsBtn}`} onClick={onLoadKDocs}>
              从金山文档加载
            </button>
          )}
          <button className={`${styles.btn} ${styles.refreshBtn}`} onClick={onRefresh}>
            刷新排名
          </button>
        </div>

        <div className={styles.autoRefresh}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => onAutoRefreshToggle(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.toggleSlider} />
            自动刷新
          </label>
          <select
            value={autoRefreshInterval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className={styles.intervalSelect}
          >
            <option value={10}>10秒</option>
            <option value={30}>30秒</option>
            <option value={60}>1分钟</option>
            <option value={120}>2分钟</option>
            <option value={300}>5分钟</option>
          </select>
        </div>
      </div>

      {dataSource === 'url' && showUrlInput && (
        <div className={styles.urlRow}>
          <div className={styles.urlInputGroup}>
            <span className={styles.urlIcon}>🔗</span>
            <input
              type="url"
              className={styles.urlInput}
              placeholder="输入金山文档链接，如 https://www.kdocs.cn/l/xxxxx"
              value={kdocsUrl}
              onChange={(e) => onKDocsUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onFetchFromUrl()}
            />
            <button
              className={`${styles.btn} ${styles.fetchBtn}`}
              onClick={onFetchFromUrl}
              disabled={isFetching || !kdocsUrl.trim()}
            >
              {isFetching ? (
                <span className={styles.spinner} />
              ) : (
                '获取数据'
              )}
            </button>
          </div>
          <p className={styles.urlHint}>
            支持 kdocs.cn/l/xxx 格式的公开共享链接。如无法直接获取，将提示使用剪贴板方式。
          </p>
        </div>
      )}
    </div>
  );
}
