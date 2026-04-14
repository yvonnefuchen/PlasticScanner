import { useLang, type Lang } from '../context/LangContext';
import styles from './LangSelector.module.css';

const LANGS: { id: Lang; label: string }[] = [
  { id: 'zh', label: '中文' },
  { id: 'ja', label: '日本語' },
  { id: 'en', label: 'EN' },
];

export function LangSelector() {
  const { lang, setLang } = useLang();
  return (
    <div className={styles.selector}>
      {LANGS.map(({ id, label }) => (
        <button
          key={id}
          className={`${styles.btn} ${lang === id ? styles.active : ''}`}
          onClick={() => setLang(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
