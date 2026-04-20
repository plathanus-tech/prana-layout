import { ReactNode } from 'react';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import styles from './Table.module.css';

/* ── Types ─────────────────────────────────────────────────────────────── */

export type StatusType =
  | 'success' | 'error' | 'warning' | 'info'
  | 'orange' | 'indigo' | 'violet' | 'pink';

export type ActionItem<T> = {
  icon: ReactNode;
  label: string;
  onClick: (row: T) => void;
  danger?: boolean;
};

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';

  /** Custom render always takes priority over `type`. */
  render?: (value: unknown, row: T) => ReactNode;

  // ─── Column types ──────────────────────────────────────────────────────
  /** 'text' (default) | 'link' | 'badge' | 'avatar' | 'toggle' | 'actions' */
  type?: 'text' | 'link' | 'badge' | 'avatar' | 'toggle' | 'actions';

  /** Used with type='badge': maps cell value → { label, status } */
  statusMap?: Record<string, { label: string; status: StatusType }>;

  /** Used with type='toggle': fires when the switch is toggled */
  onToggle?: (row: T, value: boolean) => void;

  /** Used with type='actions': list of icon-buttons shown in the cell */
  actionItems?: ActionItem<T>[];

  /** Used with type='link': builds the href from the row data */
  getHref?: (row: T) => string;

  /** Used with type='link': fires on click (prevents default when provided) */
  onLinkClick?: (row: T) => void;
};

export type TableProps<T extends Record<string, unknown>> = {
  title?: string;
  subtitle?: string;
  columns: TableColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: keyof T) => void;
  sortKey?: keyof T;
  sortDir?: 'asc' | 'desc';
};

/* ── StatusBadge ────────────────────────────────────────────────────────── */

export function StatusBadge({ status, label }: { status: StatusType; label: string }) {
  return (
    <span className={styles.badge} data-status={status}>
      <span className={styles.badgeDot} />
      {label}
    </span>
  );
}

/* ── MiniToggle ─────────────────────────────────────────────────────────── */

function MiniToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className={styles.miniToggle}>
      <input
        type="checkbox"
        className={styles.miniToggleInput}
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
      />
      <span className={styles.miniTrack}>
        <span className={styles.miniThumb} />
      </span>
    </label>
  );
}

/* ── Cell renderer ──────────────────────────────────────────────────────── */

function renderCell<T extends Record<string, unknown>>(
  col: TableColumn<T>,
  row: T,
): ReactNode {
  const value = row[col.key];

  if (col.render) return col.render(value, row);

  switch (col.type) {
    case 'badge': {
      const s = col.statusMap?.[String(value)];
      return s ? <StatusBadge status={s.status} label={s.label} /> : String(value ?? '');
    }

    case 'link':
      return (
        <a
          href={col.getHref ? col.getHref(row) : '#'}
          className={styles.cellLink}
          onClick={e => {
            if (col.onLinkClick) { e.preventDefault(); col.onLinkClick(row); }
          }}
        >
          {String(value ?? '')}
        </a>
      );

    case 'avatar':
      return (
        <img
          src={String(value ?? '')}
          alt=""
          className={styles.avatar}
        />
      );

    case 'toggle':
      return (
        <MiniToggle
          checked={Boolean(value)}
          onChange={v => col.onToggle?.(row, v)}
        />
      );

    case 'actions':
      return (
        <div className={styles.cellActions}>
          {col.actionItems?.map((action, i) => (
            <button
              key={i}
              className={[styles.actionBtn, action.danger ? styles.actionDanger : ''].filter(Boolean).join(' ')}
              onClick={() => action.onClick(row)}
              title={action.label}
              aria-label={action.label}
              type="button"
            >
              {action.icon}
            </button>
          ))}
        </div>
      );

    default:
      return String(value ?? '');
  }
}

/* ── Table ──────────────────────────────────────────────────────────────── */

export function Table<T extends Record<string, unknown>>({
  title,
  subtitle,
  columns,
  rows,
  loading,
  emptyMessage = 'Nenhum resultado encontrado.',
  onSort,
  sortKey,
  sortDir,
}: TableProps<T>) {
  return (
    <div className={styles.card}>
      {(title || subtitle) && (
        <div className={styles.cardHeader}>
          {title    && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p  className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={[styles.th, col.sortable ? styles.sortable : ''].filter(Boolean).join(' ')}
                  style={{
                    width: col.width ?? undefined,
                    textAlign: col.align ?? 'left',
                  }}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className={styles.thInner}>
                    {col.label}
                    {col.sortable && (
                      <span className={styles.sortIcon} aria-hidden="true">
                        {sortKey === col.key
                          ? sortDir === 'asc'
                            ? <ChevronUp size={12} />
                            : <ChevronDown size={12} />
                          : <ChevronsUpDown size={12} />}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles.stateCell}>
                  <span className={styles.loadingDot} />
                  Carregando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.stateCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      className={[
                        styles.td,
                        col.type === 'actions' ? styles.tdActions : '',
                      ].filter(Boolean).join(' ')}
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {renderCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
