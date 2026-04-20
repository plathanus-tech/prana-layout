import { CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
// Reutiliza exatamente o mesmo módulo CSS do OnSiteSuccessScreen
import styles from './OnSiteSuccessScreen.module.css';

// ─── Demo data ──────────────────────────────────────────

const WALKIN_TIME   = '09:30';
const DEMO_DATE     = 'hoje, segunda-feira · 13 abr';
const DEMO_SERVICE  = 'Quick Massage';

// ─── Componente ─────────────────────────────────────────

interface WalkInSuccessScreenProps {
  viewport?: 'mobile' | 'desktop';
}

export function WalkInSuccessScreen({ viewport = 'desktop' }: WalkInSuccessScreenProps) {
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
            <h1 className={styles.title}>Encaixe confirmado</h1>
            <p className={[styles.subtitle, isDesktop ? styles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
              Seu agendamento foi registrado com cuidado.
              <br />
              Siga para o atendimento quando estiver pronto.
            </p>
          </div>

          {/* Resumo */}
          <div className={styles.summary}>
            <p className={styles.summaryLabel}>Resumo do agendamento</p>
            <ul className={styles.summaryList}>
              <li className={styles.summaryItem}>
                <CheckCircle2 size={14} className={styles.summaryIconConfirmed} />
                <span>
                  {DEMO_SERVICE} — <strong>{DEMO_DATE} · {WALKIN_TIME}</strong>
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
