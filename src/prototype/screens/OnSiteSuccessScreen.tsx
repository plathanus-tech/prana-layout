import { CheckCircle2, Clock, Layers, Calendar, type LucideIcon } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { AppHeader } from '../components/AppHeader';
import type { SuccessVariant } from './SuccessScreen';
import styles from './OnSiteSuccessScreen.module.css';

// ─── Conteúdo por variante ─────────────────────────────

interface SummaryItem {
  name: string;
  time: string | null;
  day?: string;
  waitlisted: boolean;
}

interface VariantContent {
  Icon: LucideIcon;
  iconVariant: 'confirmed' | 'waitlist';
  title: string;
  subtitle: React.ReactNode;
  summary: SummaryItem[];
}

const DEMO_DATE = 'hoje, segunda-feira · 13 abr';

function getContent(variant: SuccessVariant): VariantContent {
  switch (variant) {
    case 'confirmed':
      return {
        Icon: CheckCircle2,
        iconVariant: 'confirmed',
        title: 'Seu momento foi reservado',
        subtitle: (
          <>
            Seu agendamento está confirmado.
            <br />
            Que este tempo seja um convite para pausar e cuidar de você.
          </>
        ),
        summary: [
          { name: 'Quick Massage', time: '09:00', waitlisted: false },
        ],
      };

    case 'waitlist':
      return {
        Icon: Clock,
        iconVariant: 'waitlist',
        title: 'Você está na lista de espera',
        subtitle: (
          <>
            No momento, todos os horários estão ocupados.
            <br />
            Assim que surgir disponibilidade, você será avisado.
          </>
        ),
        summary: [
          { name: 'Meditação Profunda', time: null, day: 'ter, 14 de abr', waitlisted: true },
        ],
      };

    case 'mixed':
      return {
        Icon: Layers,
        iconVariant: 'confirmed',
        title: 'Seu momento está em progresso',
        subtitle: (
          <>
            Parte do seu agendamento já foi confirmada.
            <br />
            Seguimos atentos para cuidar do restante assim que houver disponibilidade.
          </>
        ),
        summary: [
          { name: 'Quick Massage',    time: '09:00', waitlisted: false },
          { name: 'Meditação Profunda', time: null, day: 'ter, 14 de abr', waitlisted: true  },
        ],
      };
  }
}

// ─── Componente ────────────────────────────────────────

interface OnSiteSuccessScreenProps {
  viewport?: 'mobile' | 'desktop';
  variant?: SuccessVariant;
}

export function OnSiteSuccessScreen({ viewport = 'desktop', variant = 'confirmed' }: OnSiteSuccessScreenProps) {
  const isDesktop = viewport === 'desktop';
  const { Icon, iconVariant, title, subtitle, summary } = getContent(variant);

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={[styles.card, isDesktop ? styles.cardDesktop : ''].filter(Boolean).join(' ')}>

          {/* Ícone */}
          <div className={[styles.iconWrap, iconVariant === 'waitlist' ? styles.iconWrapWaitlist : ''].filter(Boolean).join(' ')}>
            <Icon size={36} strokeWidth={1.5} />
          </div>

          {/* Texto */}
          <div className={styles.body}>
            <h1 className={styles.title}>{title}</h1>
            <p className={[styles.subtitle, isDesktop ? styles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
              {subtitle}
            </p>
          </div>

          {/* Resumo */}
          <div className={styles.summary}>
            <p className={styles.summaryLabel}>Resumo do agendamento</p>
            <ul className={styles.summaryList}>
              {summary.map((item, i) => (
                <li key={i} className={styles.summaryItem}>
                  {item.waitlisted ? (
                    <>
                      <Clock size={14} className={styles.summaryIconWaitlist} />
                      <span>
                        {item.name}, <em>lista de espera{item.day ? ` · ${item.day}` : ''}</em>
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} className={styles.summaryIconConfirmed} />
                      <span>
                        {item.name}, <strong>{DEMO_DATE} · {item.time}</strong>
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Botão agenda — apenas confirmed e mixed */}
          {variant !== 'waitlist' && (
            <Button variant="secondary" size="md" iconLeft={<Calendar size={20} />}>
              Adicionar à sua agenda
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
