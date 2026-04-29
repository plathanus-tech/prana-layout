import { useState } from 'react';
import { MapPin, Calendar, Briefcase, Clock, Banknote, Wallet, Users, Building2, MailCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Feedback } from '../../components/Feedback/Feedback';
import { AppHeader } from '../components/AppHeader';
import type { ProfessionalSuccessVariant } from './ProfessionalSuccessScreen';
import styles from './ProfessionalConfirmationScreen.module.css';
import successStyles from './ProfessionalSuccessScreen.module.css';

// ─── Demo data ──────────────────────────────────────────

interface EventDay {
  key:       string;
  dayName:   string;
  dayNum:    number;
  month:     string;
  timeRange: string;
}

const EVENT_DAYS: EventDay[] = [
  { key: '2026-04-22', dayName: 'Qua', dayNum: 22, month: 'abr', timeRange: '09:00 – 17:00' },
  { key: '2026-04-23', dayName: 'Qui', dayNum: 23, month: 'abr', timeRange: '09:00 – 17:00' },
  { key: '2026-04-24', dayName: 'Sex', dayNum: 24, month: 'abr', timeRange: '09:00 – 13:00' },
];

const EVENT = {
  name:            'Programa de Bem-Estar',
  company:         'Google',
  location:        'Escritório Google · Av. Brigadeiro Faria Lima, 3477 - São Paulo',
  service:         'Quick Massage',
  sessionDuration: 15,
  totalPayment:    'R$ 840,00',
  specialRequests: [
    'Usar uniforme branco com logo Prana.',
    'Chegar com 30 minutos de antecedência para organizar o espaço.',
    'Trazer mesa dobrável e acessórios próprios.',
  ],
  travelAllowances: [
    'Reembolso de deslocamento',
    'Acomodação incluída',
    'Alimentação durante o evento',
  ],
};

// ─── Tipos ──────────────────────────────────────────────

type AllDays   = 'yes' | 'no' | null;
type SubChoice = 'partial' | 'unavailable' | null;

// ─── Componente ─────────────────────────────────────────

interface ProfessionalConfirmationScreenProps {
  viewport?:                'mobile' | 'desktop';
  variant?:                 'normal' | 'full' | 'answered-confirmed' | 'answered-declined' | 'answered-partial';
  showUpdatedValue?:        boolean;
  updatedTravelAllowance?:  string;
  updatedPayment?:          string;
  onNavigate?:              (variant: ProfessionalSuccessVariant) => void;
}

export function ProfessionalConfirmationScreen({
  viewport                = 'desktop',
  variant                 = 'normal',
  showUpdatedValue        = false,
  updatedTravelAllowance  = '',
  updatedPayment          = '',
  onNavigate,
}: ProfessionalConfirmationScreenProps) {
  const isDesktop  = viewport === 'desktop';
  const isFull     = variant === 'full';
  const isAnswered = variant === 'answered-confirmed' || variant === 'answered-declined' || variant === 'answered-partial';

  const [allDays,     setAllDays]     = useState<AllDays>(null);
  const [subChoice,   setSubChoice]   = useState<SubChoice>(null);
  const [partialDays, setPartialDays] = useState<Set<string>>(new Set());

  function selectAllDays(val: AllDays) {
    setAllDays(val);
    setSubChoice(null);
    setPartialDays(new Set());
  }

  function selectSubChoice(val: SubChoice) {
    setSubChoice(val);
    if (val !== 'partial') setPartialDays(new Set());
  }

  function toggleDay(key: string) {
    setPartialDays(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // ── CTA ──────────────────────────────────────────────────
  const canConfirm =
    allDays === 'yes' ||
    (allDays === 'no' && subChoice === 'unavailable') ||
    (allDays === 'no' && subChoice === 'partial' && partialDays.size > 0);

  function ctaLabel() {
    if (allDays === 'yes')                           return 'Confirmar participação';
    if (allDays === 'no' && subChoice === 'partial') return 'Informar disponibilidade';
    if (allDays === 'no' && subChoice === 'unavailable') return 'Confirmar indisponibilidade';
    return 'Confirmar disponibilidade';
  }

  function handleConfirm() {
    if (!canConfirm) return;
    if (allDays === 'yes')                                    onNavigate?.('confirmed');
    else if (allDays === 'no' && subChoice === 'partial')     onNavigate?.('partial');
    else if (allDays === 'no' && subChoice === 'unavailable') onNavigate?.('unavailable');
  }

  // ── Render ────────────────────────────────────────────

  // ── Renderização: Convite já respondido ──
  if (isAnswered) {
    const statusLabel =
      variant === 'answered-confirmed' ? 'Confirmado' :
      variant === 'answered-declined'  ? 'Recusado' :
                                         'Disponibilidade parcial informada';

    const badgeClass =
      variant === 'answered-confirmed' ? styles.statusBadgeConfirmed :
      variant === 'answered-declined'  ? styles.statusBadgeDeclined :
                                         styles.statusBadgePartial;

    const statusIcon =
      variant === 'answered-confirmed' ? <CheckCircle2 size={11} /> :
      variant === 'answered-declined'  ? <XCircle      size={11} /> :
                                         <Clock        size={11} />;

    return (
      <div className={successStyles.page}>
        <AppHeader />

        <div className={[successStyles.content, isDesktop ? successStyles.contentDesktop : ''].filter(Boolean).join(' ')}>
          <div className={[successStyles.card, isDesktop ? successStyles.cardDesktop : ''].filter(Boolean).join(' ')}>

            {/* Ícone */}
            <div className={[successStyles.iconWrap, successStyles.iconWrapUnavailable].join(' ')}>
              <MailCheck size={36} strokeWidth={1.5} />
            </div>

            {/* Título + subtítulo */}
            <div className={successStyles.body}>
              <h1 className={successStyles.title}>Convite já respondido</h1>
              <p className={[successStyles.subtitle, isDesktop ? successStyles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
                Você já respondeu a este convite e não pode acessá-lo novamente.
              </p>
            </div>

            {/* Resumo do evento — nome + badge na mesma linha */}
            <div className={successStyles.summary}>
              <div className={styles.summaryNameRow}>
                <p className={successStyles.summaryEventName}>{EVENT.name}</p>
                <span className={[styles.statusBadge, badgeClass].join(' ')}>
                  {statusIcon}
                  {statusLabel}
                </span>
              </div>
              <p className={successStyles.summaryLabel}>{EVENT.company}</p>
            </div>

            {/* Ornamento */}
            <div className={successStyles.ornament} aria-hidden="true">
              <span className={successStyles.ornamentLine} />
              <span className={successStyles.ornamentDot} />
              <span className={successStyles.ornamentLine} />
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Renderização: Evento Lotado ──
  if (isFull) {
    return (
      <div className={successStyles.page}>
        <AppHeader />

        <div className={[successStyles.content, isDesktop ? successStyles.contentDesktop : ''].filter(Boolean).join(' ')}>
          <div className={[successStyles.card, isDesktop ? successStyles.cardDesktop : ''].filter(Boolean).join(' ')}>

            {/* Ícone */}
            <div className={[successStyles.iconWrap, successStyles.iconWrapUnavailable].filter(Boolean).join(' ')}>
              <Users size={36} strokeWidth={1.5} />
            </div>

            {/* Texto */}
            <div className={successStyles.body}>
              <h1 className={successStyles.title}>Obrigado pelo seu interesse</h1>
              <p className={[successStyles.subtitle, isDesktop ? successStyles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
                Todas as vagas para este evento já foram preenchidas.
              </p>
            </div>

            {/* Card do evento */}
            <div className={successStyles.summary}>
              <p className={successStyles.summaryEventName}>{EVENT.name}</p>
              <p className={successStyles.summaryLabel}>As vagas foram preenchidas para este evento</p>
            </div>

            {/* Ornamento */}
            <div className={successStyles.ornament} aria-hidden="true">
              <span className={successStyles.ornamentLine} />
              <span className={successStyles.ornamentDot} />
              <span className={successStyles.ornamentLine} />
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Renderização: Normal (Formulário de Disponibilidade) ──
  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Hero */}
      <div className={styles.hero}>
        <div className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}>
          <span className={styles.heroTag}>Convite</span>
          <h1 className={styles.heroTitle}>{EVENT.name}</h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>

        {/* ── 1. Resumo do evento ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Resumo do evento</h2>

          <div className={styles.eventCard}>
            <div className={styles.infoRows}>

              <div className={styles.infoRow}>
                <MapPin size={14} className={styles.infoIcon} />
                <div className={styles.infoBody}>
                  <span className={styles.infoLabel}>Local</span>
                  <span className={styles.infoValue}>{EVENT.location}</span>
                </div>
              </div>

              <div className={styles.infoSep} />

              <div className={styles.infoRow}>
                <Building2 size={14} className={styles.infoIcon} />
                <div className={styles.infoBody}>
                  <span className={styles.infoLabel}>Empresa</span>
                  <span className={styles.infoValue}>{EVENT.company}</span>
                </div>
              </div>

              <div className={styles.infoSep} />

              <div className={styles.infoRow}>
                <Calendar size={14} className={styles.infoIcon} />
                <div className={styles.infoBody}>
                  <span className={styles.infoLabel}>Data e horário</span>
                  {EVENT_DAYS.map(day => (
                    <span key={day.key} className={styles.infoValue}>
                      {day.dayName}, {day.dayNum} de {day.month} · {day.timeRange}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.infoSep} />

              <div className={styles.infoRow}>
                <Briefcase size={14} className={styles.infoIcon} />
                <div className={styles.infoBody}>
                  <span className={styles.infoLabel}>Serviço</span>
                  <span className={styles.infoValue}>{EVENT.service}</span>
                </div>
              </div>

              <div className={styles.infoSep} />

              <div className={styles.infoRow}>
                <Clock size={14} className={styles.infoIcon} />
                <div className={styles.infoBody}>
                  <span className={styles.infoLabel}>Duração por sessão</span>
                  <span className={styles.infoValue}>{EVENT.sessionDuration} min</span>
                  <span className={styles.infoNote}>
                    Serve como orientação de atendimento, não altera o valor total.
                  </span>
                </div>
              </div>

            </div>

            <div className={styles.paymentRow}>
              <div className={styles.paymentBody}>
                <span className={styles.paymentAmount}>{EVENT.totalPayment}</span>
                <span className={styles.paymentLabel}>Valor total pelo trabalho</span>
              </div>
              <div className={styles.paymentIconWrap}>
                <Banknote size={20} />
              </div>
            </div>

            {/* Ajuda de Custo */}
            <div className={styles.infoSep} />

            <div className={styles.infoRow}>
              <Wallet size={14} className={styles.infoIcon} />
              <div className={styles.infoBody}>
                <span className={styles.infoLabel}>Ajuda de Custo</span>
                <ul className={styles.allowanceList}>
                  {EVENT.travelAllowances.map((item, idx) => (
                    <li key={idx} className={styles.allowanceItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Pedidos especiais ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pedidos especiais</h2>
          <div className={styles.specialCard}>
            <ul className={styles.specialList}>
              {EVENT.specialRequests.map((req, i) => (
                <li key={i} className={styles.specialItem}>
                  <span className={styles.specialBullet} aria-hidden="true" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 3. Disponibilidade ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sua disponibilidade</h2>

          {/* Pergunta principal */}
          <div className={styles.choiceBlock}>
            <p className={styles.choiceQuestion}>
              Você pode participar de todos os dias?
            </p>
            <div className={styles.choiceGrid}>
              <button
                className={[
                  styles.choiceBtn,
                  allDays === 'yes' ? styles.choiceBtnYesActive : '',
                ].filter(Boolean).join(' ')}
                onClick={() => selectAllDays('yes')}
              >
                Sim
              </button>
              <button
                className={[
                  styles.choiceBtn,
                  allDays === 'no' ? styles.choiceBtnNoActive : '',
                ].filter(Boolean).join(' ')}
                onClick={() => selectAllDays('no')}
              >
                Não
              </button>
            </div>
          </div>

          {/* Sub-opções — aparece ao selecionar "Não" */}
          {allDays === 'no' && (
            <div className={styles.subSection}>

              {/* Opção A: informar dias */}
              <button
                className={[
                  styles.optionCard,
                  subChoice === 'partial' ? styles.optionCardActive : '',
                ].filter(Boolean).join(' ')}
                onClick={() => selectSubChoice('partial')}
              >
                <div className={[
                  styles.optionRadio,
                  subChoice === 'partial' ? styles.optionRadioActive : '',
                ].filter(Boolean).join(' ')}>
                  {subChoice === 'partial' && <span className={styles.optionRadioDot} />}
                </div>
                <div className={styles.optionInfo}>
                  <span className={styles.optionName}>Informar dias disponíveis</span>
                  <span className={styles.optionSub}>
                    Selecione os dias que você pode participar
                  </span>
                </div>
              </button>

              {/* Day strip — aparece ao escolher parcial */}
              {subChoice === 'partial' && (
                <>
                  <div className={styles.dayStrip}>
                    {EVENT_DAYS.map(day => {
                      const isSelected = partialDays.has(day.key);
                      return (
                        <button
                          key={day.key}
                          className={[
                            styles.dayBtn,
                            isSelected ? styles.dayBtnSelected : '',
                          ].filter(Boolean).join(' ')}
                          onClick={() => toggleDay(day.key)}
                        >
                          <span className={styles.dayName}>{day.dayName}</span>
                          <span className={styles.dayNum}>{day.dayNum}</span>
                          <span className={styles.dayMonth}>{day.month}</span>
                        </button>
                      );
                    })}
                  </div>

                  <Feedback
                    type="info"
                    title="Seleção informativa"
                    message="Selecione os dias disponíveis. Entraremos em contato se necessário."
                  />
                </>
              )}

              {/* Divisor "ou" */}
              <div className={styles.orDivider}>
                <span className={styles.orLine} />
                <span className={styles.orLabel}>ou</span>
                <span className={styles.orLine} />
              </div>

              {/* Opção B: não poderei participar */}
              <button
                className={[
                  styles.declineBtn,
                  subChoice === 'unavailable' ? styles.declineBtnActive : '',
                ].filter(Boolean).join(' ')}
                onClick={() => selectSubChoice('unavailable')}
              >
                <div className={[
                  styles.declineRadio,
                  subChoice === 'unavailable' ? styles.declineRadioActive : '',
                ].filter(Boolean).join(' ')}>
                  {subChoice === 'unavailable' && <span className={styles.declineRadioDot} />}
                </div>
                <span>Não poderei participar</span>
              </button>

            </div>
          )}

        </section>

      </div>

      {/* CTA */}
      <div className={styles.ctaBar}>
        <div className={[styles.ctaInner, isDesktop ? styles.ctaInnerDesktop : ''].filter(Boolean).join(' ')}>
          <div className={styles.buttonWrapper}>
            <Button
              variant="primary"
              size="lg"
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              {ctaLabel()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
