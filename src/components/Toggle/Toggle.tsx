import { InputHTMLAttributes } from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  checked?: boolean;
}

export function Toggle({ label, checked = false, disabled = false, onChange, id, ...props }: ToggleProps) {
  const toggleId = id ?? `toggle-${Math.random().toString(36).slice(2)}`;
  return (
    <label
      className={[styles.wrapper, checked ? styles.checked : '', disabled ? styles.disabled : ''].filter(Boolean).join(' ')}
      htmlFor={toggleId}
    >
      <input
        type="checkbox"
        id={toggleId}
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        role="switch"
        aria-checked={checked}
        {...props}
      />
      <span className={styles.track}><span className={styles.thumb} /></span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
