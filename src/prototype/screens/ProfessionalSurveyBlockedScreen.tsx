import { AlertCircle } from 'lucide-react';
import styles from './OnSiteSuccessScreen.module.css';

// ─── Componente ─────────────────────────────────────────────────────────────

interface ProfessionalSurveyBlockedScreenProps {
  viewport?: 'mobile' | 'desktop';
  respondentName?: string;
}

export function ProfessionalSurveyBlockedScreen({
  viewport = 'desktop',
  respondentName = 'outro profissional',
}: ProfessionalSurveyBlockedScreenProps) {
  const isDesktop = viewport === 'desktop';

  return (
    <div className={styles.page}>
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={[styles.card, isDesktop ? styles.cardDesktop : ''].filter(Boolean).join(' ')}>

          {/* Ícone */}
          <div className={styles.iconWrap}>
            <AlertCircle size={36} strokeWidth={1.5} />
          </div>

          {/* Texto */}
          <div className={styles.body}>
            <h1 className={styles.title}>Pesquisa já respondida</h1>
            <p className={[styles.subtitle, isDesktop ? styles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
              Esta pesquisa já foi respondida por <strong>{respondentName}</strong>.
              <br />Agradecemos sua disponibilidade!
            </p>
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
