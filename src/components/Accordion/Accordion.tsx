import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

export interface AccordionItem { title: string; content: string; }

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIndex?: number[];
}

export function Accordion({ items, allowMultiple = false, defaultOpenIndex = [] }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set(defaultOpenIndex));

  const toggle = (i: number) => {
    setOpenIndexes(prev => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); }
      else {
        if (!allowMultiple) next.clear();
        next.add(i);
      }
      return next;
    });
  };

  return (
    <div className={styles.accordion}>
      {items.map((item, i) => (
        <div key={i} className={[styles.item, openIndexes.has(i) ? styles.open : ''].join(' ')}>
          <button className={styles.trigger} onClick={() => toggle(i)} aria-expanded={openIndexes.has(i)}>
            <span>{item.title}</span>
            <span className={styles.chevron}><ChevronDown size={16} /></span>
          </button>
          <div className={styles.panel} aria-hidden={!openIndexes.has(i)}>
            <div className={styles.content}>{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
