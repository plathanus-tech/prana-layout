import { ReactNode } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}

export function Tooltip({ content, placement = 'top', children }: TooltipProps) {
  return (
    <span className={styles.wrapper}>
      {children}
      <span className={[styles.tip, styles[placement]].join(' ')}>
        <span className={styles.arrow} />
        {content}
      </span>
    </span>
  );
}
