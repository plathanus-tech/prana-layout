// TELA: Dashboard
// ROLES COM ACESSO: admin, empresa
// PERMISSÕES:
//   admin   → view (global) — abas Visão Geral + Impacto
//   empresa → view (própria empresa) — apenas conteúdo Impacto, sem abas
// ESCOPO DE DADOS: global (admin) | empresa (empresa)

import { useState } from 'react';
import {
  CalendarCheck, Building2, ContactRound, DollarSign,
  MapPin, TrendingUp, Users, Activity, Heart, ChevronDown,
} from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import styles from './DashboardScreen.module.css';
import tooltipStyles from '../../../components/Tooltip/Tooltip.module.css';

export type UserRole  = 'adm' | 'empresa';
export type ActiveTab = 'visao-geral' | 'impacto';

// ─── Trend Arrow ──────────────────────────────────────────────────────────────
type TrendDir = 'up' | 'down';
function TrendArrow({ dir }: { dir: TrendDir }) {
  if (dir === 'up') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 9L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 3h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 3v6H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string; trend: string;
  trendDir: TrendDir; icon: React.ReactNode;
}
function StatCard({ label, value, trend, trendDir, icon }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statBody}>
        <div className={styles.statLabelGroup}>
          <span className={styles.statLabel}>{label}</span>
          <span className={styles.statValue}>{value}</span>
        </div>
        <div className={styles.statFooter}>
          <span className={[styles.trendBadge, trendDir === 'up' ? styles.trendUp : styles.trendDown].join(' ')}>
            <TrendArrow dir={trendDir} />
            {trend}
          </span>
          <span className={styles.trendLabel}>vs mês anterior</span>
        </div>
      </div>
      <div className={styles.statIconBox}>{icon}</div>
    </div>
  );
}

// ─── Event Row ────────────────────────────────────────────────────────────────
const EVENT_BADGE_STYLE: Record<string, React.CSSProperties> = {
  Confirmado: {
    background: 'var(--color-status-success-bg)',
    borderColor: 'var(--color-green-300)',
    color: 'var(--color-status-success-fg)',
  },
  Pendente: {
    background: 'var(--color-status-orange-bg)',
    borderColor: '#FED7AA',
    color: 'var(--color-status-orange-fg)',
  },
};

interface EventRowProps {
  dateTop: string; dateBottom: string; title: string;
  company: string; location: string; status: string; divider?: boolean;
}
function EventRow({ dateTop, dateBottom, title, company, location, status, divider }: EventRowProps) {
  const badgeStyle = EVENT_BADGE_STYLE[status] ?? EVENT_BADGE_STYLE['Confirmado'];
  return (
    <>
      <div className={styles.eventRow}>
        <div className={styles.eventDateBox}>
          <span className={styles.eventDateTop}>{dateTop}</span>
          <span className={styles.eventDateBottom}>{dateBottom}</span>
        </div>
        <div className={styles.eventDetails}>
          <span className={styles.eventTitle}>{title}</span>
          <div className={styles.eventMeta}>
            <span className={styles.eventMetaItem}>
              <Building2 size={16} className={styles.eventMetaIcon} />{company}
            </span>
            <span className={styles.eventMetaItem}>
              <MapPin size={16} className={styles.eventMetaIcon} />{location}
            </span>
          </div>
        </div>
        <div className={styles.eventStatusBadge} style={badgeStyle}>{status}</div>
      </div>
      {divider && <div className={styles.eventDivider} />}
    </>
  );
}

// ─── Horizontal Bar Chart (Visão Geral) ──────────────────────────────────────
interface BarItem { label: string; pct: number; }
function HorizontalBarChart({
  title, items, barHeight = 14, rowGap = 8,
}: { title: string; items: BarItem[]; barHeight?: number; rowGap?: number }) {
  const maxPct = items[0].pct;
  const [hovered, setHovered] = useState<{ label: string; pct: number; x: number; y: number } | null>(null);

  return (
    <div className={styles.chartCard}>
      <span className={styles.chartTitle}>{title}</span>
      <div className={styles.barChartBody} style={{ gap: rowGap }}>
        {items.map(item => (
          <div key={item.label} className={styles.barRow}
            onMouseMove={(e) => setHovered({ label: item.label, pct: item.pct, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.barLabel}>{item.label}</span>
            <div className={styles.barTrackGroup}>
              <div className={styles.barTrack} style={{ height: barHeight }}>
                <div className={styles.barFill} style={{ width: `${(item.pct / maxPct) * 100}%`, height: barHeight }} />
              </div>
              <span className={styles.barPct}>{item.pct}%</span>
            </div>
          </div>
        ))}
      </div>
      {hovered && (
        <div className={tooltipStyles.tip} style={{
          position: 'fixed', left: hovered.x, top: hovered.y - 44,
          transform: 'translateX(-50%)', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 9999, opacity: 1,
        }}>
          {hovered.label}: {hovered.pct}%
        </div>
      )}
    </div>
  );
}

// ─── Pie Chart (Visão Geral — intocado) ──────────────────────────────────────
interface PieSlice { label: string; pct: number; color: string; }

function PieChartSVG({ slices }: { slices: PieSlice[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const cx = 110, cy = 110, r = 100, size = 220;
  let cumulative = 0;
  const paths = slices.map((slice, i) => {
    const startAngle = (cumulative / 100) * 360 - 90;
    cumulative += slice.pct;
    const endAngle = (cumulative / 100) * 360 - 90;
    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${slice.pct > 50 ? 1 : 0} 1 ${x2} ${y2} Z`;
    return { d, color: slice.color, label: slice.label, pct: slice.pct, index: i };
  });

  function handleMouseMove(e: React.MouseEvent<SVGPathElement>, index: number) {
    const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHovered(index);
  }

  return (
    <div className={styles.pieWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}
        onMouseLeave={() => setHovered(null)}>
        {paths.map(p => (
          <path key={p.index} d={p.d} fill={p.color}
            opacity={hovered !== null && hovered !== p.index ? 0.65 : 1}
            style={{ cursor: 'pointer', transition: 'opacity 150ms ease' }}
            onMouseMove={e => handleMouseMove(e, p.index)} />
        ))}
      </svg>
      {hovered !== null && (
        <div className={tooltipStyles.tip} style={{
          position: 'absolute', left: tooltipPos.x, top: tooltipPos.y - 40,
          transform: 'translateX(-50%)', pointerEvents: 'none', opacity: 1,
        }}>
          {slices[hovered].label} {slices[hovered].pct}%
        </div>
      )}
    </div>
  );
}

function PieChart() {
  const slices: PieSlice[] = [
    { label: 'Sim', pct: 84, color: '#B25557' },
    { label: 'Não', pct: 16, color: '#CFADAE' },
  ];
  return (
    <div className={styles.chartCard}>
      <span className={styles.chartTitle}>Repetiria a ação</span>
      <div className={styles.pieBody}>
        <PieChartSVG slices={slices} />
        <div className={styles.pieLegend}>
          {slices.map(s => (
            <div key={s.label} className={styles.pieLegendItem}>
              <span className={styles.pieDot} style={{ background: s.color }} />
              <span className={styles.pieLegendText}>{s.label} {s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPACTO TAB — COMPONENTES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Evolution Line Chart ─────────────────────────────────────────────────────
interface LinePoint { month: string; nps: number; ibe: number; }
const LINE_DATA: LinePoint[] = [
  { month: 'Jan', nps: 68, ibe: 71 },
  { month: 'Fev', nps: 72, ibe: 69 },
  { month: 'Mar', nps: 70, ibe: 74 },
  { month: 'Abr', nps: 75, ibe: 77 },
  { month: 'Mai', nps: 78, ibe: 73 },
  { month: 'Jun', nps: 82, ibe: 80 },
];

function EvolutionLineChart() {
  const [hovered, setHovered] = useState<(LinePoint & { px: number; py: number }) | null>(null);
  const W = 560, H = 200;
  const padL = 48, padT = 20, padR = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const yMin = 55, yMax = 95;
  const n = LINE_DATA.length;
  const xOf = (i: number) => padL + (i / (n - 1)) * chartW;
  const yOf = (v: number) => padT + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const npsPath = LINE_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(d.nps).toFixed(1)}`).join(' ');
  const ibePath = LINE_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(d.ibe).toFixed(1)}`).join(' ');
  const gridVals = [60, 70, 80, 90];

  return (
    <div className={styles.chartCardWide} style={{ minHeight: 'unset' }}>
      <div className={styles.chartHeaderRow}>
        <span className={styles.chartTitle}>Evolução</span>
        <div className={styles.lineLegend}>
          <div className={styles.lineLegendItem}><span className={styles.lineDot} style={{ background: '#B25557' }} />NPS</div>
          <div className={styles.lineLegendItem}><span className={styles.lineDot} style={{ background: '#CFADAE' }} />IBE</div>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          {gridVals.map(v => (
            <g key={v}>
              <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="#F0EDEC" strokeWidth="1" />
              <text x={padL - 8} y={yOf(v) + 4} textAnchor="end" fontSize="10" fill="#9E8E8F">{v}</text>
            </g>
          ))}
          {LINE_DATA.map((d, i) => (
            <text key={d.month} x={xOf(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#9E8E8F">{d.month}</text>
          ))}
          <path d={`${npsPath} L ${xOf(n - 1)} ${padT + chartH} L ${xOf(0)} ${padT + chartH} Z`} fill="#B25557" fillOpacity="0.07" />
          <path d={`${ibePath} L ${xOf(n - 1)} ${padT + chartH} L ${xOf(0)} ${padT + chartH} Z`} fill="#CFADAE" fillOpacity="0.12" />
          <path d={npsPath} fill="none" stroke="#B25557" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ibePath} fill="none" stroke="#CFADAE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {hovered && (
            <line x1={hovered.px} y1={padT} x2={hovered.px} y2={padT + chartH}
              stroke="#B25557" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
          )}
          {LINE_DATA.map((d, i) => (
            <circle key={`n${i}`} cx={xOf(i)} cy={yOf(d.nps)} r={hovered?.month === d.month ? 6 : 4}
              fill="#B25557" stroke="#fff" strokeWidth="2" style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered({ ...d, px: xOf(i), py: yOf(d.nps) })}
              onMouseLeave={() => setHovered(null)} />
          ))}
          {LINE_DATA.map((d, i) => (
            <circle key={`e${i}`} cx={xOf(i)} cy={yOf(d.ibe)} r={hovered?.month === d.month ? 6 : 4}
              fill="#CFADAE" stroke="#fff" strokeWidth="2" style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered({ ...d, px: xOf(i), py: yOf(d.ibe) })}
              onMouseLeave={() => setHovered(null)} />
          ))}
        </svg>
        {hovered && (
          <div className={tooltipStyles.tip} style={{
            position: 'absolute',
            left: `${(hovered.px / W) * 100}%`,
            top: `${(hovered.py / H) * 100}%`,
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none', whiteSpace: 'nowrap', opacity: 1,
          }}>
            {hovered.month} · NPS {hovered.nps} · IBE {hovered.ibe}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Grouped Bar Chart (Participação) ────────────────────────────────────────
interface PartItem { label: string; convidados: number; presentes: number; }
const PART_DATA: PartItem[] = [
  { label: 'SIPAT Itaú',  convidados: 200, presentes: 165 },
  { label: 'Sem. Saúde',  convidados: 150, presentes: 120 },
  { label: 'QV Natura',   convidados: 300, presentes: 240 },
  { label: 'Day Ambev',   convidados: 180, presentes: 160 },
  { label: 'CIPA Vale',   convidados: 250, presentes: 210 },
];

function ParticipationBarChart() {
  const [hovered, setHovered] = useState<(PartItem & { bx: number; by: number }) | null>(null);
  const W = 400, H = 220;
  const padL = 8, padT = 20, padR = 8, padB = 44;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = PART_DATA.length;
  const maxVal = Math.max(...PART_DATA.map(d => d.convidados));
  const groupW = chartW / n;
  const barW = 22, barGap = 5;
  const xCenter = (i: number) => padL + i * groupW + groupW / 2;
  const bH = (v: number) => (v / maxVal) * chartH;
  const bY = (v: number) => padT + chartH - bH(v);

  return (
    <div className={styles.chartCard} style={{ minHeight: 'unset' }}>
      <div className={styles.chartHeaderRow}>
        <span className={styles.chartTitle}>Participação</span>
        <div className={styles.lineLegend}>
          <div className={styles.lineLegendItem}><span className={styles.lineDot} style={{ background: '#CFADAE', borderRadius: 2 }} />Convidados</div>
          <div className={styles.lineLegendItem}><span className={styles.lineDot} style={{ background: '#B25557', borderRadius: 2 }} />Presentes</div>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#F0EDEC" strokeWidth="1" />
          {PART_DATA.map((d, i) => {
            const cx = xCenter(i);
            return (
              <g key={d.label}>
                <rect x={cx - barGap / 2 - barW} y={bY(d.convidados)} width={barW} height={bH(d.convidados)}
                  fill="#CFADAE" rx="3" style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered({ ...d, bx: cx, by: bY(d.convidados) })}
                  onMouseLeave={() => setHovered(null)} />
                <rect x={cx + barGap / 2} y={bY(d.presentes)} width={barW} height={bH(d.presentes)}
                  fill="#B25557" rx="3" style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered({ ...d, bx: cx, by: bY(d.presentes) })}
                  onMouseLeave={() => setHovered(null)} />
                <text x={cx} y={H - 6} textAnchor="middle" fontSize="9" fill="#9E8E8F">{d.label}</text>
              </g>
            );
          })}
        </svg>
        {hovered && (
          <div className={tooltipStyles.tip} style={{
            position: 'absolute',
            left: `${(hovered.bx / W) * 100}%`,
            top: `${(hovered.by / H) * 100}%`,
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none', whiteSpace: 'nowrap', opacity: 1,
          }}>
            {hovered.label} · {hovered.presentes} presentes / {hovered.convidados} convidados
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NPS Distribution ─────────────────────────────────────────────────────────
const NPS_SEGMENTS = [
  { label: 'Promotores',  pct: 62, color: '#22C55E', bg: '#F0FDF4', border: '#86EFAC' },
  { label: 'Neutros',     pct: 24, color: '#EAB308', bg: '#FEFCE8', border: '#FDE047' },
  { label: 'Detratores',  pct: 14, color: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5' },
];

function NPSDistribution() {
  const [hovered, setHovered] = useState<{ label: string; pct: number; x: number; y: number } | null>(null);

  return (
    <div className={styles.chartCard} style={{ minHeight: 'unset' }}>
      <span className={styles.chartTitle}>Distribuição NPS</span>
      <div className={styles.npsSegmentWrap}>
        {/* Segmented bar com tooltip */}
        <div className={styles.npsBar}>
          {NPS_SEGMENTS.map((s, i) => (
            <div key={s.label} className={styles.npsBarSegment}
              style={{
                width: `${s.pct}%`,
                background: s.color,
                borderRadius: i === 0 ? '6px 0 0 6px' : i === NPS_SEGMENTS.length - 1 ? '0 6px 6px 0' : '0',
                cursor: 'pointer',
              }}
              onMouseMove={(e) => setHovered({ label: s.label, pct: s.pct, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </div>
        {/* NPS score */}
        <div className={styles.npsScore}>
          <span className={styles.npsScoreValue}>48</span>
          <span className={styles.npsScoreLabel}>NPS Score</span>
        </div>
        {/* Legend */}
        <div className={styles.npsLegend}>
          {NPS_SEGMENTS.map(s => (
            <div key={s.label} className={styles.npsLegendItem}
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <span className={styles.pieDot} style={{ background: s.color }} />
              <span className={styles.npsLegendLabel}>{s.label}</span>
              <span className={styles.npsLegendPct} style={{ color: s.color }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Tooltip */}
      {hovered && (
        <div className={tooltipStyles.tip} style={{
          position: 'fixed', left: hovered.x, top: hovered.y - 44,
          transform: 'translateX(-50%)', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 9999, opacity: 1,
        }}>
          {hovered.label}: {hovered.pct}%
        </div>
      )}
    </div>
  );
}

// ─── Radar Chart ─────────────────────────────────────────────────────────────
const RADAR_DATA = [
  { axis: 'Bem-estar',   value: 8.2 },
  { axis: 'Relaxamento', value: 7.8 },
  { axis: 'Foco',        value: 7.1 },
  { axis: 'Engajamento', value: 8.5 },
  { axis: 'Clima',       value: 9.0 },
];

function RadarChart() {
  const [hovered, setHovered] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

  // viewBox generoso — labels de texto ficam dentro dos limites do card
  const VW = 400, VH = 340;
  const cx = 200, cy = 170, maxR = 95, maxVal = 10;
  const n = RADAR_DATA.length;
  const angleOf = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const ptOf = (v: number, i: number) => ({
    x: cx + (v / maxVal) * maxR * Math.cos(angleOf(i)),
    y: cy + (v / maxVal) * maxR * Math.sin(angleOf(i)),
  });

  const levels = [2, 4, 6, 8, 10];
  const dataPolygon = RADAR_DATA.map((d, i) => {
    const p = ptOf(d.value, i);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <div className={styles.chartCard} style={{ minHeight: 'unset' }}>
      <span className={styles.chartTitle}>Radar de Pesquisa</span>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
          {/* Grid rings */}
          {levels.map(lv => {
            const pts = RADAR_DATA.map((_, i) => { const p = ptOf(lv, i); return `${p.x},${p.y}`; }).join(' ');
            return <polygon key={lv} points={pts} fill="none" stroke="#F0EDEC" strokeWidth="1" />;
          })}
          {/* Level labels (inner) */}
          {[4, 8].map(lv => {
            const p = ptOf(lv, 2); // Foco axis (going right)
            return <text key={lv} x={p.x + 3} y={p.y + 3} fontSize="8" fill="#C8C0C0">{lv}</text>;
          })}
          {/* Axes */}
          {RADAR_DATA.map((_, i) => {
            const end = ptOf(maxVal, i);
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E8DFE0" strokeWidth="1" />;
          })}
          {/* Data fill */}
          <polygon points={dataPolygon} fill="#B25557" fillOpacity="0.18" stroke="#B25557" strokeWidth="2" />
          {/* Data points */}
          {RADAR_DATA.map((d, i) => {
            const p = ptOf(d.value, i);
            const isHov = hovered?.label === d.axis;
            return (
              <circle key={i} cx={p.x} cy={p.y} r={isHov ? 7 : 5}
                fill="#B25557" stroke="#fff" strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 120ms' }}
                onMouseMove={(e) => setHovered({ label: d.axis, value: d.value, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHovered(null)} />
            );
          })}
          {/* Axis labels */}
          {RADAR_DATA.map((d, i) => {
            const angle = angleOf(i);
            // labelR = maxR + 28 = 123 → garante que texto fica dentro do viewBox 400×340
            const lx = cx + (maxR + 28) * Math.cos(angle);
            const ly = cy + (maxR + 28) * Math.sin(angle);
            const anchor = Math.cos(angle) > 0.15 ? 'start' : Math.cos(angle) < -0.15 ? 'end' : 'middle';
            return (
              <text key={i} x={lx} y={ly + 4} textAnchor={anchor} fontSize="11" fill="#9E8E8F" fontWeight="500">
                {d.axis}
              </text>
            );
          })}
        </svg>
        {/* HTML tooltip — mesmo padrão do sistema */}
        {hovered && (
          <div className={tooltipStyles.tip} style={{
            position: 'fixed', left: hovered.x, top: hovered.y - 44,
            transform: 'translateX(-50%)', pointerEvents: 'none',
            whiteSpace: 'nowrap', zIndex: 9999, opacity: 1,
          }}>
            {hovered.label}: {hovered.value} / 10
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Service Ratings (barra grossa + tooltip) ─────────────────────────────────
const SERVICE_RATINGS = [
  { label: 'Meditação',          rating: 9.5 },
  { label: 'Massagem',           rating: 9.2 },
  { label: 'Ginástica Laboral',  rating: 8.7 },
  { label: 'Quick Massage',      rating: 8.1 },
  { label: 'Yoga',               rating: 7.9 },
];

function ServiceRatings() {
  const [hovered, setHovered] = useState<{ label: string; rating: number; x: number; y: number } | null>(null);

  return (
    <div className={styles.chartCard} style={{ minHeight: 'unset' }}>
      <span className={styles.chartTitle}>Notas por serviço</span>
      <div className={styles.barChartBody} style={{ gap: 24 }}>
        {SERVICE_RATINGS.map(s => (
          <div key={s.label} className={styles.barRow} style={{ cursor: 'pointer' }}
            onMouseMove={(e) => setHovered({ label: s.label, rating: s.rating, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHovered(null)}
          >
            <span className={styles.barLabel}>{s.label}</span>
            <div className={styles.barTrackGroup}>
              {/* barras mais grossas via inline style — Visão Geral fica intacta */}
              <div className={styles.barTrack} style={{ height: 20 }}>
                <div className={styles.barFill} style={{ width: `${(s.rating / 10) * 100}%`, height: 20 }} />
              </div>
              <span className={styles.barPct}>{s.rating}</span>
            </div>
          </div>
        ))}
      </div>
      {hovered && (
        <div className={tooltipStyles.tip} style={{
          position: 'fixed', left: hovered.x, top: hovered.y - 44,
          transform: 'translateX(-50%)', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 9999, opacity: 1,
        }}>
          {hovered.label} · {hovered.rating} / 10
        </div>
      )}
    </div>
  );
}

// ─── Qualitative Comments ─────────────────────────────────────────────────────
const COMMENTS = [
  { text: 'A massagem foi incrível, me ajudou a relaxar e focar no trabalho.', author: 'Colaborador · TI' },
  { text: 'A ginástica laboral melhorou minha postura em apenas uma semana!', author: 'Colaborador · RH' },
  { text: 'Adorei a sessão de meditação, trouxe muita leveza pro dia.', author: 'Colaborador · Financeiro' },
  { text: 'Ótima organização do evento. Equipe muito profissional.', author: 'Gestora · Benefícios' },
];

function QualitativeComments() {
  return (
    <div className={styles.chartCard}>
      <span className={styles.chartTitle}>Comentários qualitativos</span>
      <div className={styles.commentsList}>
        {COMMENTS.map((c, i) => (
          <div key={i} className={styles.commentCard}>
            <span className={styles.commentIcon}>❝</span>
            <div className={styles.commentBody}>
              <p className={styles.commentText}>{c.text}</p>
              <span className={styles.commentAuthor}>{c.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Benchmark Section (empresa only) ────────────────────────────────────────
// active: true  → cor principal brand (#B25557) — dado do cliente
// active: false → cinza sólido legível — dado de referência
const BENCHMARK_ITEMS = [
  {
    title: 'Evento vs. Média',
    // label 'Este evento' é substituído dinamicamente por 'Último evento'
    // quando o filtro estiver em "todos os eventos"
    left:  { label: 'Este evento', value: '82', active: true,  dynamic: true },
    right: { label: 'Média geral', value: '71', active: false, dynamic: false },
    metric: 'NPS', delta: '+11 pts', positive: true,
  },
  {
    title: 'Empresa vs. Benchmark',
    left:  { label: 'Sua empresa', value: '78', active: true,  dynamic: false },
    right: { label: 'Benchmark*',  value: '65', active: false, dynamic: false },
    metric: 'IBE', delta: '+13 pts', positive: true,
    note: '* Anonimizado — média do setor',
  },
  {
    title: 'Antes vs. Depois',
    left:  { label: 'Antes',  value: '70', active: false, dynamic: false },
    right: { label: 'Depois', value: '82', active: true,  dynamic: false },
    metric: 'NPS', delta: '+12 pts', positive: true,
  },
];

// Cor baseada no tipo: dado ativo = brand, referência = gray/600
const benchColor = (active: boolean) =>
  active ? '#B25557' : 'var(--color-gray-600)';

interface BenchmarkSectionProps { filterEvent: string; }
function BenchmarkSection({ filterEvent }: BenchmarkSectionProps) {
  // Sem filtro de evento específico → contexto é "todos os eventos" → mostrar "Último evento"
  const isAllEvents = !filterEvent;

  const resolveLabel = (label: string, dynamic: boolean) => {
    if (dynamic && isAllEvents) return 'Último evento';
    return label;
  };

  return (
    <div className={styles.benchmarkRow}>
      {BENCHMARK_ITEMS.map(item => (
        <div key={item.title} className={styles.benchmarkCard}>
          <span className={styles.chartTitle}>{item.title}</span>
          <div className={styles.benchmarkValues}>
            <div className={styles.benchmarkSide}>
              <span className={styles.benchmarkValue} style={{ color: benchColor(item.left.active) }}>
                {item.left.value}
              </span>
              <span className={styles.benchmarkMetric}>{item.metric}</span>
              <span className={styles.benchmarkSideLabel}>
                {resolveLabel(item.left.label, item.left.dynamic)}
              </span>
            </div>
            <div className={styles.benchmarkVs}>
              <span className={[styles.trendBadge, item.positive ? styles.trendUp : styles.trendDown].join(' ')}>
                {item.delta}
              </span>
            </div>
            <div className={styles.benchmarkSide}>
              <span className={styles.benchmarkValue} style={{ color: benchColor(item.right.active) }}>
                {item.right.value}
              </span>
              <span className={styles.benchmarkMetric}>{item.metric}</span>
              <span className={styles.benchmarkSideLabel}>
                {resolveLabel(item.right.label, item.right.dynamic)}
              </span>
            </div>
          </div>
          {'note' in item && item.note && (
            <span className={styles.benchmarkNote}>{item.note}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Impacto Tab Container ────────────────────────────────────────────────────
interface ImpactoTabProps { role: UserRole; filterEvent: string; }
function ImpactoTab({ role, filterEvent }: ImpactoTabProps) {
  return (
    <div className={styles.impactoSection}>
      {/* KPIs */}
      <div className={styles.statCardsRow}>
        <StatCard label="NPS"                       value="82"    trend="+5 pts" trendDir="up" icon={<TrendingUp  size={24} />} />
        <StatCard label="IBE"                       value="7.8"   trend="+0.4"   trendDir="up" icon={<Activity    size={24} />} />
        <StatCard label="Taxa de Participação"      value="83%"   trend="+6%"    trendDir="up" icon={<Users       size={24} />} />
        <StatCard label="Colaboradores Impactados"  value="1.240" trend="+180"   trendDir="up" icon={<Heart       size={24} />} />
      </div>

      {/* Evolução + Participação */}
      <div className={styles.impactoRow}>
        <EvolutionLineChart />
        <ParticipationBarChart />
      </div>

      {/* Distribuição NPS + Radar — lado a lado */}
      <div className={styles.chartsRow}>
        <NPSDistribution />
        <RadarChart />
      </div>

      {/* Notas por serviço */}
      <ServiceRatings />

      {/* ── Seções exclusivas do perfil Empresa ─────────────────────────────── */}
      {role === 'empresa' && (
        <>
          {/* Comparativos / Benchmark */}
          <BenchmarkSection filterEvent={filterEvent} />

          {/* Próximos Eventos */}
          <div className={styles.eventsCard}>
            <span className={styles.sectionTitle}>Próximos Eventos</span>
            <div className={styles.eventsList}>
              <EventRow dateTop="13 a 15" dateBottom="Abril" title="SIPAT - Itaú Unibanco"    company="Itaú Unibanco" location="Pinheiros, São Paulo - SP" status="Confirmado" divider />
              <EventRow dateTop="14 e 15" dateBottom="Abril" title="Semana da saúde - Natura" company="Natura"        location="Pinheiros, São Paulo - SP" status="Confirmado" divider />
              <EventRow dateTop="20 e 21" dateBottom="Maio"  title="Dia da Saúde - Ambev"     company="Ambev"         location="Vila Leopoldina, SP"        status="Pendente" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Visão Geral data ─────────────────────────────────────────────────────────
const DIFERENCIAIS: BarItem[] = [
  { label: 'Técnica',         pct: 22 },
  { label: 'Organização',     pct: 18 },
  { label: 'Apresentação',    pct: 15 },
  { label: 'Padronização',    pct: 14 },
  { label: 'Custo/beneficio', pct: 12 },
  { label: 'Pontualidade',    pct: 10 },
  { label: 'Outro',           pct: 9  },
];

const PONTOS_MELHORIAS: BarItem[] = [
  { label: 'Custo/beneficio', pct: 22 },
  { label: 'Pontualidade',    pct: 18 },
  { label: 'Organização',     pct: 15 },
  { label: 'Outro',           pct: 14 },
  { label: 'Padronização',    pct: 12 },
  { label: 'Apresentação',    pct: 10 },
  { label: 'Técnica',         pct: 9  },
];

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
interface DashboardScreenProps {
  role: UserRole;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  /** Deslocamento horizontal do sidebar fixo do app (px). */
  sidebarOffset?: number;
  /** Callback opcional: notifica o shell quando um item do sidebar é clicado.
   *  Usado pelo PrototypingShell para navegação entre jornadas. */
  onNavChange?: (item: string) => void;
}

export function DashboardScreen({ role, activeTab, onTabChange, sidebarOffset = 0, onNavChange }: DashboardScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav]     = useState('dashboard');
  // '' = todos os eventos (sem filtro específico)
  const [filterEvent, setFilterEvent] = useState('');
  const showTabs = role === 'adm';

  return (
    <div className={styles.shell} style={{ '--proto-offset': `${sidebarOffset}px` } as React.CSSProperties}>
      <div className={styles.sidebarFixed}>
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
          activeItem={activeNav}
          onNavClick={(item) => { setActiveNav(item); onNavChange?.(item); }}
          user={{ name: 'Admin Prana', email: 'admin@prana.com', initials: 'AP' }}
          role={role}
        />
      </div>

      <div className={[styles.contentWrap, !sidebarOpen ? styles.contentWrapClosed : ''].filter(Boolean).join(' ')}>
        <div className={styles.contentCard}>

          {/* Header: título + filtros */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <div className={styles.pageFilters}>
              <div className={styles.filterWrap}>
                <select
                  className={styles.filterSelect}
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                >
                  <option value="">Todos os eventos</option>
                  <option value="sipat-itau">SIPAT - Itaú Unibanco</option>
                  <option value="semana-natura">Semana da Saúde - Natura</option>
                  <option value="dia-ambev">Dia da Saúde - Ambev</option>
                </select>
                <ChevronDown size={14} className={styles.filterChevron} />
              </div>
              <div className={styles.filterWrap}>
                <select className={styles.filterSelect} defaultValue="">
                  <option value="" disabled>Período</option>
                  <option>Últimos 30 dias</option>
                  <option>Últimos 3 meses</option>
                  <option>Último semestre</option>
                  <option>Último ano</option>
                </select>
                <ChevronDown size={14} className={styles.filterChevron} />
              </div>
            </div>
          </div>

          {/* Tabs — apenas adm */}
          {showTabs && (
            <div className={styles.tabsRow}>
              <button
                className={[styles.tab, activeTab === 'visao-geral' ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => onTabChange('visao-geral')}
              >Visão geral</button>
              <button
                className={[styles.tab, activeTab === 'impacto' ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => onTabChange('impacto')}
              >Impacto</button>
            </div>
          )}

          {/* Conteúdo da aba ativa */}
          {activeTab === 'visao-geral' ? (
            <>
              <div className={styles.statCardsRow}>
                <StatCard label="Total de eventos" value="124"     trend="+12%" trendDir="up"   icon={<CalendarCheck size={24} />} />
                <StatCard label="Clientes ativos"  value="24"      trend="+4%"  trendDir="up"   icon={<Building2     size={24} />} />
                <StatCard label="Profisionais"     value="123"     trend="-2%"  trendDir="down" icon={<ContactRound  size={24} />} />
                <StatCard label="Receita total"    value="R$ 234k" trend="+4%"  trendDir="up"   icon={<DollarSign    size={24} />} />
              </div>
              <div className={styles.eventsCard}>
                <span className={styles.sectionTitle}>Próximos eventos</span>
                <div className={styles.eventsList}>
                  <EventRow dateTop="13 a 15" dateBottom="Abril" title="SIPAT - Itaú Unibanco"    company="Itaú unibanco" location="Pinheiros, São Paulo - SP" status="Confirmado" divider />
                  <EventRow dateTop="14 e 15" dateBottom="Abril" title="Semana da saúde - Natura" company="Natura"        location="Pinheiros, São Paulo - SP" status="Confirmado" divider />
                  <EventRow dateTop="14 e 15" dateBottom="Abril" title="Semana da saúde - Natura" company="Natura"        location="Pinheiros, São Paulo - SP" status="Confirmado" />
                </div>
              </div>
              <div className={styles.chartsRow}>
                <HorizontalBarChart title="Diferenciais"        items={DIFERENCIAIS}     barHeight={20} rowGap={16} />
                <HorizontalBarChart title="Pontos de melhorias" items={PONTOS_MELHORIAS} barHeight={20} rowGap={16} />
                <PieChart />
              </div>
            </>
          ) : (
            <ImpactoTab role={role} filterEvent={filterEvent} />
          )}

        </div>
      </div>
    </div>
  );
}
