import styles from './Footer.module.css';

interface Props {
  lastUpdate: string;
}

export function Footer({ lastUpdate }: Props) {
  return (
    <footer className={styles.footer}>
      <p>
        数据来源:{' '}
        <a href="https://www.kdocs.cn/l/cvbs6aq4axHu" target="_blank" rel="noreferrer">
          金山文档表格
        </a>
      </p>
      <p className={styles.lastUpdate}>最后更新: {lastUpdate || '--'}</p>
    </footer>
  );
}
