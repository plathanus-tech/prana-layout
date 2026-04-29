import { CheckCircle2, Clock, Layers, Calendar } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { AppHeader } from '../components/AppHeader';
import styles from './SuccessScreen.module.css';

// ─── Variantes ─────────────────────────────────────────────

export type SuccessVariant = 'confirmed' | 'waitlist' | 'mixed';

// Dados demo para o protótipo — em produção viriam do estado da seleção
const DEMO = {
  confirmed: {
    dayTime: 'segunda-feira, 13 de abril · 09:00',
  },
  waitlist: {
    day: 'terça-feira, 14 de abril',
  },
  mixed: {
    confirmedDayTime: 'segunda-feira, 13 de abril · 09:00',
    waitlistDay: 'terça-feira, 14 de abril',
  },
};

// ─── Summary items por variante ────────────────────────────

interface SummaryItem { name: string; professional: string; dayTime?: string; waitlisted: boolean; }

const SUMMARY: Record<string, SummaryItem[]> = {
  confirmed: [
    { name: 'Quick Massage', professional: 'Juliana Braga', dayTime: DEMO.confirmed.dayTime, waitlisted: false },
  ],
  waitlist: [
    { name: 'Quick Massage', professional: 'Juliana Braga', dayTime: DEMO.waitlist.day, waitlisted: true },
  ],
  mixed: [
    { name: 'Quick Massage', professional: 'Juliana Braga', dayTime: DEMO.mixed.confirmedDayTime, waitlisted: false },
    { name: 'Reflexologia',  professional: 'Ana Costa',     dayTime: DEMO.mixed.waitlistDay, waitlisted: true },
  ],
};

// ─── Conteúdo por variante ─────────────────────────────────

interface VariantContent {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  subtitle: React.ReactNode;
}

function getContent(variant: SuccessVariant): VariantContent {
  switch (variant) {
    case 'confirmed':
      return {
        Icon: CheckCircle2,
        title: 'Seu momento foi reservado',
        subtitle: (
          <>
            Seu agendamento está confirmado.
            <br />
            Que este tempo seja um convite para pausar, respirar e cuidar de você.
          </>
        ),
      };

    case 'waitlist':
      return {
        Icon: Clock,
        title: 'Você está na lista de espera',
        subtitle: (
          <>
            No momento, todos os horários estão ocupados.
            <br />
            Assim que surgir uma disponibilidade, você será avisado para seguir com seu agendamento.
          </>
        ),
      };

    case 'mixed':
      return {
        Icon: Layers,
        title: 'Seu momento está em progresso',
        subtitle: (
          <>
            Parte do seu agendamento já foi confirmada.
            <br />
            Seguimos atentos para cuidar do restante assim que houver disponibilidade.
          </>
        ),
      };
  }
}

// ─── Componente ────────────────────────────────────────────

interface SuccessScreenProps {
  viewport?: 'mobile' | 'desktop';
  variant?: SuccessVariant;
}

export function SuccessScreen({ viewport = 'desktop', variant = 'confirmed' }: SuccessScreenProps) {
  const isDesktop = viewport === 'desktop';
  const { Icon, title, subtitle } = getContent(variant);
  const summaryItems = SUMMARY[variant] ?? null;

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={[styles.card, isDesktop ? styles.cardDesktop : ''].filter(Boolean).join(' ')}>

          {/* Ícone */}
          <div className={[
            styles.iconWrap,
            variant === 'waitlist' ? styles.iconWrapWaitlist : '',
          ].filter(Boolean).join(' ')}>
            <Icon size={36} strokeWidth={1.5} />
          </div>

          {/* Texto */}
          <div className={styles.body}>
            <h1 className={styles.title}>{title}</h1>
            <p className={[styles.subtitle, isDesktop ? styles.subtitleDesktop : ''].filter(Boolean).join(' ')}>{subtitle}</p>
          </div>

          {/* Resumo */}
          {summaryItems && (
            <div className={styles.summary}>
              <p className={styles.summaryLabel}>Resumo do agendamento</p>
              <ul className={styles.summaryList}>
                {summaryItems.map((item, i) => (
                  <li key={i} className={styles.summaryItem}>
                    {item.waitlisted ? (
                      <>
                        <Clock size={14} className={styles.summaryIconWaitlist} />
                        <span>{item.name} com {item.professional} — <em>lista de espera{item.dayTime ? ` · ${item.dayTime}` : ''}</em></span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} className={styles.summaryIconConfirmed} />
                        <span>{item.name} com {item.professional} — <strong>{item.dayTime}</strong></span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botão agenda */}
          {summaryItems && (
            <Button variant="secondary" size="md" iconLeft={<Calendar size={20} />}>
              Adicionar à sua agenda
            </Button>
          )}

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
