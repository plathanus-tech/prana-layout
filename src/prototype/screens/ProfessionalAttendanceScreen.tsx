import { useState, useRef, useEffect } from 'react';
import { Building2, Calendar, MapPin, QrCode, MessageCircle, Link2, X } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Dropdown } from '../../components/Dropdown/Dropdown';
import { Input } from '../../components/Input/Input';
import { Feedback } from '../../components/Feedback/Feedback';
import { AppHeader } from '../components/AppHeader';
import styles from './ProfessionalAttendanceScreen.module.css';

// ─── Demo data ───────────────────────────────────────────

interface ProfessionalEvent {
  id:        string;
  eventName: string;
  company:   string;
  shortDate: string;   // para o dropdown (ex: "24 abr", "12–14 mai")
  fullLabel: string;   // para o card    (ex: "Hoje, sex · 24 de abr", "12 a 14 de mai")
  timeRange: string;
  location:  string;
}

const EVENTS: ProfessionalEvent[] = [
  {
    id:        'evt-1',
    eventName: 'Semana do Bem-Estar',
    company:   'Plathanus',
    shortDate: '24 abr',
    fullLabel: 'Hoje, sex · 24 de abr',
    timeRange: '09:00–18:00',
    location:  'São Paulo, SP',
  },
  {
    id:        'evt-2',
    eventName: 'Dia da Saúde',
    company:   'Accenture',
    shortDate: '25 abr',
    fullLabel: 'Sáb · 25 de abr',
    timeRange: '09:00–17:00',
    location:  'São Paulo, SP',
  },
  {
    id:        'evt-3',
    eventName: 'Bem-Estar Corporativo',
    company:   'iFood',
    shortDate: '28 abr',
    fullLabel: 'Ter · 28 de abr',
    timeRange: '10:00–18:00',
    location:  'Campinas, SP',
  },
  {
    id:        'evt-4',
    eventName: 'Cuidado em Movimento',
    company:   'Bradesco',
    shortDate: '12–14 mai',
    fullLabel: '12 a 14 de mai',
    timeRange: '09:00–18:00',
    location:  'Rio de Janeiro, RJ',
  },
];

// ─── Opções do filtro ────────────────────────────────────

const EVENT_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos os eventos' },
  ...EVENTS.map(e => ({ value: e.id, label: `${e.eventName} · ${e.shortDate}` })),
];

// ─── Tipos de modal ──────────────────────────────────────

type ModalType = 'qrcode' | 'whatsapp' | 'walkin';

const MODAL_TITLE: Record<ModalType, string> = {
  qrcode:   'QR Code do evento',
  whatsapp: 'Convidar por WhatsApp',
  walkin:   'Link de encaixe',
};

const MODAL_SUBTITLE: Record<ModalType, string> = {
  qrcode:
    'Apresente este código para o beneficiário agendar seu horário.',
  whatsapp:
    'O beneficiário receberá um link para agendar um horário disponível neste evento.',
  walkin:
    'O beneficiário receberá um link para se cadastrar e ser atendido imediatamente, conforme disponibilidade.',
};

const MODAL_SEND_LABEL: Record<'whatsapp' | 'walkin', string> = {
  whatsapp: 'Enviar convite',
  walkin:   'Enviar link de encaixe',
};

// ─── Componente ──────────────────────────────────────────

interface ProfessionalAttendanceScreenProps {
  viewport?: 'mobile' | 'desktop';
}

export function ProfessionalAttendanceScreen({
  viewport = 'desktop',
}: ProfessionalAttendanceScreenProps) {
  const isDesktop = viewport === 'desktop';

  // ── Filtro de evento ──────────────────────────────────
  const [eventFilter, setEventFilter] = useState<string>('all');

  // ── Estado dos modais ─────────────────────────────────
  const [activeModal, setActiveModal] = useState<{ type: ModalType; eventId: string } | null>(null);
  const [whatsapp,    setWhatsapp]    = useState('');
  const [whatsappErr, setWhatsappErr] = useState<string | null>(null);

  const activeEvent = EVENTS.find(e => e.id === activeModal?.eventId);

  // ── Toast de sucesso ──────────────────────────────────
  const [toast,   setToast]   = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (toastRef.current) clearTimeout(toastRef.current); };
  }, []);

  function showToast(msg: string) {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => {
      setToast(null);
      toastRef.current = null;
    }, 4000);
  }

  // ── Handlers ─────────────────────────────────────────
  function openModal(type: ModalType, eventId: string) {
    setActiveModal({ type, eventId });
    setWhatsapp('');
    setWhatsappErr(null);
  }

  function closeModal() {
    setActiveModal(null);
    setWhatsapp('');
    setWhatsappErr(null);
  }

  function handleSend() {
    const digits = whatsapp.replace(/\D/g, '');
    if (digits.length < 10) {
      setWhatsappErr('Informe um número de WhatsApp válido');
      return;
    }
    closeModal();
    showToast('Link enviado para o beneficiário com sucesso');
  }

  // ── Lista filtrada ────────────────────────────────────
  const filteredEvents = eventFilter === 'all'
    ? EVENTS
    : EVENTS.filter(e => e.id === eventFilter);

  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Toast de sucesso — topo, fixo, 4 s */}
      {toast && (
        <div className={styles.toast}>
          <Feedback type="success" message={toast} />
        </div>
      )}

      {/* Hero */}
      <div className={styles.hero}>
        <div className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}>
          <p className={styles.heroTag}>Prana · Profissional</p>
          <h1 className={styles.heroTitle}>Meus atendimentos</h1>
        </div>
      </div>

      {/* Filtro por evento — Dropdown */}
      <div className={[styles.filterRow, isDesktop ? styles.filterRowDesktop : ''].filter(Boolean).join(' ')}>
        <div className={styles.filterDropdown}>
          <Dropdown
            options={EVENT_FILTER_OPTIONS}
            value={eventFilter}
            onChange={setEventFilter}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>

        {filteredEvents.length === 0 ? (
          <p className={styles.emptyState}>Nenhum evento encontrado.</p>
        ) : (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {filteredEvents.length === 1 ? 'Seu evento confirmado' : 'Seus eventos confirmados'}
            </h2>

            <ul className={styles.list}>
              {filteredEvents.map(evt => (
                <li key={evt.id} className={styles.card}>

                  {/* Informações do evento */}
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>
                      <Building2 size={18} />
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardName}>{evt.eventName}</span>
                      <span className={styles.cardMeta}>
                        <Building2 size={11} />
                        {evt.company}
                      </span>
                      <span className={styles.cardMeta}>
                        <Calendar size={11} />
                        {evt.fullLabel} · {evt.timeRange}
                      </span>
                      <span className={styles.cardMeta}>
                        <MapPin size={11} />
                        {evt.location}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className={[styles.cardActions, !isDesktop ? styles.cardActionsMobile : ''].filter(Boolean).join(' ')}>
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft={<QrCode size={14} />}
                      onClick={() => openModal('qrcode', evt.id)}
                      style={{ flex: 1 }}
                    >
                      QR Code
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft={<MessageCircle size={14} />}
                      onClick={() => openModal('whatsapp', evt.id)}
                      style={{ flex: 1 }}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<Link2 size={14} />}
                      onClick={() => openModal('walkin', evt.id)}
                      style={{ flex: 1 }}
                    >
                      Encaixe
                    </Button>
                  </div>

                </li>
              ))}
            </ul>
          </section>
        )}

      </div>

      {/* ─── Modais ─────────────────────────────────────── */}
      {activeModal && activeEvent && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            {/* Cabeçalho — X sempre visível */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{MODAL_TITLE[activeModal.type]}</h2>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            {/* Corpo */}
            <div className={styles.modalBody}>
              <p className={styles.modalSubtitle}>
                {MODAL_SUBTITLE[activeModal.type]}
              </p>

              {/* Resumo do evento */}
              <div className={styles.modalSummary}>
                <div className={styles.modalSummaryIcon}>
                  <Building2 size={16} />
                </div>
                <div className={styles.modalSummaryInfo}>
                  <span className={styles.modalSummaryName}>{activeEvent.eventName}</span>
                  <span className={styles.modalSummaryMeta}>
                    <Calendar size={11} />
                    {activeEvent.fullLabel} · {activeEvent.timeRange}
                  </span>
                </div>
              </div>

              {/* QR Code — apenas ícone, sem rodapé */}
              {activeModal.type === 'qrcode' && (
                <div className={styles.qrWrapper}>
                  <div className={styles.qrBox}>
                    <QrCode size={100} strokeWidth={1.25} />
                  </div>
                </div>
              )}

              {/* Campo de WhatsApp — sem ícone interno */}
              {activeModal.type !== 'qrcode' && (
                <Input
                  label="WhatsApp do beneficiário"
                  placeholder="(11) 99999-9999"
                  type="tel"
                  value={whatsapp}
                  onChange={e => { setWhatsapp(e.target.value); setWhatsappErr(null); }}
                  error={whatsappErr ?? undefined}
                />
              )}
            </div>

            {/* Rodapé — apenas modais WhatsApp / Encaixe */}
            {activeModal.type !== 'qrcode' && (
              <div className={styles.modalFooter}>
                <Button
                  variant="primary"
                  size="md"
                  style={{ flex: 1 }}
                  onClick={handleSend}
                >
                  {MODAL_SEND_LABEL[activeModal.type]}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  style={{ flex: 1 }}
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
