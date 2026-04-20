import { InputHTMLAttributes } from 'react';
import { Check, Minus } from 'lucide-react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
}

export function Checkbox({ label, checked = false, indeterminate = false, disabled = false, onChange, id, ...props }: CheckboxProps) {
  const cbId = id ?? `cb-${Math.random().toString(36).slice(2)}`;
  const cls = [styles.wrapper, checked ? styles.checked : '', indeterminate ? styles.indeterminate : '', disabled ? styles.disabled : ''].filter(Boolean).join(' ');

  return (
    <label className={cls} htmlFor={cbId}>
      <input type="checkbox" id={cbId} className={styles.input} checked={checked} disabled={disabled} onChange={onChange} {...props} />
      <span className={styles.box}>
        {indeterminate ? <span className={styles.mark}><Minus size={12} strokeWidth={3} /></span> : checked ? <span className={styles.mark}><Check size={12} strokeWidth={3} /></span> : null}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
