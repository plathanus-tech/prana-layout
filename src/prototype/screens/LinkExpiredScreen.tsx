import { Link2Off } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
// Reutiliza o módulo da tela de sucesso — padrão visual idêntico
import styles from './SuccessScreen.module.css';

// ─── Componente ─────────────────────────────────────────────────────────────

interface LinkExpiredScreenProps {
  viewport?:   'mobile' | 'desktop';
  /** Oculta o botão "Fechar" quando não há ação disponível */
  hideAction?: boolean;
  /** Callback do botão "Fechar" — em produção fecharia a aba */
  onNavigate?: () => void;
}

export function LinkExpiredScreen({
  viewport    = 'desktop',
  hideAction  = false,
  onNavigate,
}: LinkExpiredScreenProps) {
  const isDesktop = viewport === 'desktop';

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={[styles.card, isDesktop ? styles.cardDesktop : ''].filter(Boolean).join(' ')}>

          {/* Ícone */}
          <div className={[styles.iconWrap, styles.iconWrapNeutral].join(' ')}>
            <Link2Off size={36} strokeWidth={1.5} />
          </div>

          {/* Texto */}
          <div className={styles.body}>
            <h1 className={styles.title}>Link expirado</h1>
            <p className={[styles.subtitle, isDesktop ? styles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
              Este link não está mais disponível.
              <br />
              O prazo para acesso foi encerrado.
            </p>
          </div>

          {/* Ornamento decorativo */}
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
