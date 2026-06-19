import { CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import styles from './OnSiteSuccessScreen.module.css';

// ─── Demo data ───────────────────────────────────────────────────────────────

const EVENT_NAME = 'Programa de Bem-Estar';
const CHECKIN_TIME = '09:15';
const CHECKIN_DATE = 'hoje, segunda-feira · 13 abr';

// ─── Componente ──────────────────────────────────────────────────────────────

interface ProfessionalCheckinSuccessScreenProps {
  viewport?: 'mobile' | 'desktop';
}

export function ProfessionalCheckinSuccessScreen({
  viewport = 'desktop',
}: ProfessionalCheckinSuccessScreenProps) {
  const isDesktop = viewport === 'desktop';

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={[styles.card, isDesktop ? styles.cardDesktop : ''].filter(Boolean).join(' ')}>

          {/* Ícone */}
          <div className={styles.iconWrap}>
            <CheckCircle2 size={36} strokeWidth={1.5} />
          </div>

          {/* Texto */}
          <div className={styles.body}>
            <h1 className={styles.title}>Check-in realizado</h1>
            <p className={[styles.subtitle, isDesktop ? styles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
              Sua presença foi confirmada com sucesso.
              <br />
              Bom atendimento!
            </p>
          </div>

          {/* Resumo */}
          <div className={styles.summary}>
            <p className={styles.summaryLabel}>{EVENT_NAME}</p>
            <ul className={styles.summaryList}>
              <li className={styles.summaryItem}>
                <CheckCircle2 size={14} className={styles.summaryIconConfirmed} />
                <span>
                  Check-in registrado — <strong>{CHECKIN_DATE} · {CHECKIN_TIME}</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Ornamento */}
          <div className={styles.ornament} aria-hidden="true">
            <span className={styles.ornamentLine} />
            <span className={styles.ornamentDot} />
            <span className={styles.ornamentLine} />
          </div>

        </div>
      </div>
    </div>
  );
}
