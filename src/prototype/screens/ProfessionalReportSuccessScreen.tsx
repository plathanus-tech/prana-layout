import { CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import styles from './OnSiteSuccessScreen.module.css';

// ─── Demo data ───────────────────────────────────────────────────────────────

const EVENT_NAME = 'Programa de Bem-Estar';

// ─── Componente ──────────────────────────────────────────────────────────────

interface ProfessionalReportSuccessScreenProps {
  viewport?: 'mobile' | 'desktop';
}

export function ProfessionalReportSuccessScreen({
  viewport = 'desktop',
}: ProfessionalReportSuccessScreenProps) {
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
            <h1 className={styles.title}>Obrigado pelo relatório</h1>
            <p className={[styles.subtitle, isDesktop ? styles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
              Sua contribuição foi registrada com sucesso.
              <br />
              Isso nos ajuda a melhorar continuamente nossos eventos.
            </p>
          </div>

          {/* Card do evento */}
          <div className={styles.summary}>
            <p className={styles.summaryEventName}>{EVENT_NAME}</p>
            <p className={styles.summaryLabel}>Relatório enviado com sucesso</p>
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
