import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Feedback.module.css';

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

export interface FeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Feedback({ type, message, title, dismissible, onDismiss }: FeedbackProps) {
  return (
    <div className={[styles.alert, styles[type]].join(' ')} role="alert">
      <span className={styles.icon}>{ICONS[type]}</span>
      <div className={styles.body}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
      </div>
      {dismissible && (
        <button className={styles.dismiss} onClick={onDismiss} aria-label="Fechar"><X size={16} /></button>
      )}
    </div>
  );
}
