import { useState } from 'react';
import styles from './SearchBox.module.css';

interface Props {
  onSearch: (keyword: string) => void;
}

export function SearchBox({ onSearch }: Props) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    onSearch(v.trim().toLowerCase());
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.box}>
        <input
          type="text"
          className={styles.input}
          placeholder="🔍 搜索战队名称..."
          value={value}
          onChange={handleChange}
        />
        {value && (
          <button className={styles.clear} onClick={handleClear}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
