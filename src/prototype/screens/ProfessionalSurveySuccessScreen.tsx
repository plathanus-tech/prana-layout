import { CheckCircle2, Star, ExternalLink } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import styles from './OnSiteSuccessScreen.module.css';

// ─── Tipos ──────────────────────────────────────────────────────────────────
export type ProfessionalSurveySuccessVariant = 'positive' | 'neutral';

// ─── Componente ─────────────────────────────────────────────────────────────

interface ProfessionalSurveySuccessScreenProps {
  viewport?: 'mobile' | 'desktop';
  variant?: ProfessionalSurveySuccessVariant;
}

export function ProfessionalSurveySuccessScreen({
  viewport = 'desktop',
  variant = 'positive',
}: ProfessionalSurveySuccessScreenProps) {
  const isDesktop = viewport === 'desktop';
  const isPositive = variant === 'positive';

  return (
    <div className={styles.page}>
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={[styles.card, isDesktop ? styles.cardDesktop : ''].filter(Boolean).join(' ')}>

          {/* Ícone */}
          <div className={styles.iconWrap}>
            {isPositive
              ? <Star size={36} strokeWidth={1.5} />
              : <CheckCircle2 size={36} strokeWidth={1.5} />
            }
          </div>

          {/* Texto */}
          <div className={styles.body}>
            <h1 className={styles.title}>Obrigado pelo seu feedback!</h1>
            <p className={[styles.subtitle, isDesktop ? styles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
              {isPositive
                ? <>Ficamos muito felizes com sua experiência.<br />Que tal compartilhar com mais pessoas?</>
                : <>Recebemos sua avaliação com atenção.<br />Trabalharemos para melhorar cada vez mais.</>
              }
            </p>
          </div>

          {/* CTA Google — apenas variante positiva */}
          {isPositive && (
            <Button variant="primary" size="md" iconLeft={<ExternalLink size={16} />}>
              Avaliar no Google
            </Button>
          )}

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
