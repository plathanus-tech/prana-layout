import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CircleX } from 'lucide-react';
import styles from './Dropdown.module.css';

export interface DropdownOption { label: string; value: string; }

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
}

export function Dropdown({ options, value, onChange, placeholder = 'Selecione...', disabled = false, label, error }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={[styles.wrapper, open ? styles.open : '', error ? styles.hasError : ''].filter(Boolean).join(' ')}>
      {label && <span className={styles.label}>{label}</span>}
      <button className={styles.trigger} onClick={() => !disabled && setOpen(v => !v)} disabled={disabled} type="button">
        <span className={selected ? '' : styles.placeholder}>{selected?.label ?? placeholder}</span>
        <span className={styles.chevron}><ChevronDown size={16} /></span>
      </button>
      <div className={styles.menu}>
        {options.map(opt => (
          <div key={opt.value} className={[styles.option, opt.value === value ? styles.selected : ''].filter(Boolean).join(' ')}
            onClick={() => { onChange?.(opt.value); setOpen(false); }}>
            {opt.label}
          </div>
        ))}
      </div>
      {error && (
        <span className={styles.errorText}>
          <CircleX size={14} className={styles.msgIcon} />
          {error}
        </span>
      )}
    </div>
  );
}
