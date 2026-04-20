import styles from './RadioButton.module.css';

export interface RadioOption { label: string; value: string; }

export interface RadioButtonProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  label?: string;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

export function RadioButton({ options, value, onChange, name, label, disabled = false, orientation = 'vertical' }: RadioButtonProps) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      {label && <legend className={styles.label}>{label}</legend>}
      <div className={[styles.group, orientation === 'horizontal' ? styles.horizontal : ''].filter(Boolean).join(' ')}>
        {options.map(opt => (
          <label key={opt.value} className={[styles.option, value === opt.value ? styles.checked : '', disabled ? styles.disabled : ''].filter(Boolean).join(' ')}>
            <input type="radio" className={styles.input} name={name} value={opt.value} checked={value === opt.value} disabled={disabled} onChange={() => onChange?.(opt.value)} />
            <span className={styles.circle}><span className={styles.dot} /></span>
            <span className={styles.optionLabel}>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
