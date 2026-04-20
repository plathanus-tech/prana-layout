import { ReactNode, useState } from 'react';
import styles from './Tab.module.css';

export interface TabItem { label: string; content: ReactNode; }

export interface TabProps {
  tabs: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
}

export function Tab({ tabs, defaultIndex = 0, onChange }: TabProps) {
  const [active, setActive] = useState(defaultIndex);

  const select = (i: number) => { setActive(i); onChange?.(i); };

  return (
    <div className={styles.wrapper}>
      <div className={styles.list} role="tablist">
        {tabs.map((tab, i) => (
          <button key={i} role="tab" aria-selected={active === i} aria-controls={`tabpanel-${i}`}
            className={[styles.tab, active === i ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => select(i)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div id={`tabpanel-${active}`} role="tabpanel" className={styles.panel}>
        {tabs[active]?.content}
      </div>
    </div>
  );
}
