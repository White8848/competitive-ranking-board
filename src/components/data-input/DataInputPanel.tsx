import { useState, useRef } from 'react';
import type { DataSource } from '../../types';
import styles from './DataInputPanel.module.css';

interface Props {
  dataSource: DataSource;
  onParseTable: (text: string) => void;
  onParseCSV: (text: string) => void;
  onFileUpload: (content: string) => void;
  pasteAreaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function DataInputPanel({
  dataSource,
  onParseTable,
  onParseCSV,
  onFileUpload,
  pasteAreaRef,
}: Props) {
  const [csvInput, setCsvInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      onFileUpload(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  if (dataSource === 'sample' || dataSource === 'url') return null;

  return (
    <div className={styles.panel}>
      {dataSource === 'kdocs' && (
        <>
          <div className={styles.sectionHeader}>
            <h3>从金山文档导入数据</h3>
          </div>
          <div className={styles.notice}>
            <div className={styles.noticeIcon}>💡</div>
            <div>
              <strong>实时自动更新使用方法</strong>
              <p>1. 复制表格数据并点击"解析表格数据"</p>
              <p>2. 启用"自动刷新"功能，设置刷新间隔</p>
              <p>3. 表格更新时，在金山文档中复制新数据，应用自动检测并更新</p>
            </div>
          </div>
          <div className={styles.methods}>
            <div className={styles.method}>
              <div className={styles.methodHeader}>
                <span className={styles.methodIcon}>📋</span>
                <h4>手动复制表格</h4>
              </div>
              <ol>
                <li>
                  打开{' '}
                  <a href="https://www.kdocs.cn/l/cvbs6aq4axHu" target="_blank" rel="noreferrer">
                    金山文档链接
                  </a>
                </li>
                <li>选中<strong>整个表格</strong>（包括标题行）</li>
                <li>复制 (Ctrl+C) 并粘贴到下方</li>
              </ol>
              <textarea
                ref={pasteAreaRef}
                className={styles.textarea}
                placeholder="在这里粘贴从金山文档复制的整个表格数据..."
              />
              <button
                className={styles.actionBtn}
                onClick={() => {
                  const text = pasteAreaRef?.current?.value || '';
                  onParseTable(text);
                }}
              >
                解析表格数据
              </button>
            </div>
            <div className={styles.method}>
              <div className={styles.methodHeader}>
                <span className={styles.methodIcon}>📁</span>
                <h4>导出为CSV</h4>
              </div>
              <ol>
                <li>打开金山文档</li>
                <li>点击 文件 → 下载 → CSV格式</li>
                <li>上传CSV文件</li>
              </ol>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className={styles.fileInput}
                onChange={handleFileChange}
              />
              <button
                className={`${styles.actionBtn} ${styles.uploadBtn}`}
                onClick={() => fileInputRef.current?.click()}
              >
                上传CSV文件
              </button>
            </div>
          </div>
        </>
      )}

      {dataSource === 'manual' && (
        <>
          <div className={styles.sectionHeader}>
            <h3>手动输入比赛数据</h3>
          </div>
          <p className={styles.hint}>请输入CSV数据，格式：队伍名称,胜场数,负场数,积分</p>
          <textarea
            className={styles.textarea}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder={`示例：\n队伍A,10,2,28\n队伍B,8,4,24\n队伍C,7,5,21`}
          />
          <button className={styles.actionBtn} onClick={() => onParseCSV(csvInput)}>
            解析数据
          </button>
        </>
      )}
    </div>
  );
}
