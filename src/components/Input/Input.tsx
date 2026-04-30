import { InputHTMLAttributes, ReactNode } from 'react';
import { CircleX, CircleCheck } from 'lucide-react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Oculta o ícone CircleX dentro da mensagem de erro. Útil quando o indicador
   *  visual de erro é fornecido por outro elemento (ex: Feedback block). */
  hideErrorIcon?: boolean;
}

export function Input({ label, helperText, error, success, iconLeft, iconRight, hideErrorIcon = false, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const wrapClass = [
    styles.inputWrap,
    iconLeft ? styles.hasLeft : '',
    iconRight ? styles.hasRight : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={[styles.wrapper, error ? styles.error : '', className ?? ''].filter(Boolean).join(' ')}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <div className={wrapClass}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        <input id={inputId} className={styles.input} {...props} />
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>
      {error && (
        <span className={styles.errorText}>
          {!hideErrorIcon && <CircleX size={14} className={styles.msgIcon} />}
          {error}
        </span>
      )}
      {!error && success && (
        <span className={styles.successText}>
          <CircleCheck size={14} className={styles.msgIcon} />
          {success}
        </span>
      )}
      {!error && !success && helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}
