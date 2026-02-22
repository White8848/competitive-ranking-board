import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <h1>🏆 竞技排行榜</h1>
      <p className={styles.subtitle}>实时战队排名 · 基于胜负分与净胜分综合排序</p>
    </header>
  );
}
