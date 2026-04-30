import { useState, useRef, useEffect, FormEvent } from 'react';
import { Loader2, MessageCircle, Mail } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Feedback } from '../../components/Feedback/Feedback';
import { AppHeader } from '../components/AppHeader';
import styles from './LinkOTPScreen.module.css';

// TODO: integração pendente — qualquer código de 6 dígitos é aceito no protótipo.
// Em produção, substituir por validação real via API (ex: POST /otp/verify).
const RESEND_SECONDS   = 30;
const DEMO_WHATSAPP    = '+55 (11) 9 9999-9999';
const DEMO_EMAIL_ONSITE = 'maria@empresa.com.br';

interface LinkOTPScreenProps {
  viewport?: 'mobile' | 'desktop';
  /** Canal de entrega do código OTP. Padrão: 'whatsapp'. */
  channel?: 'whatsapp' | 'email';
  /** Contato exibido no subtítulo (telefone ou e-mail). Usa valor demo se omitido. */
  contact?: string;
  onNavigate?: () => void;
}

export function LinkOTPScreen({
  viewport = 'desktop',
  channel  = 'whatsapp',
  contact,
  onNavigate,
}: LinkOTPScreenProps) {
  const isDesktop       = viewport === 'desktop';
  const resolvedContact = contact ?? (channel === 'email' ? DEMO_EMAIL_ONSITE : DEMO_WHATSAPP);
  const Icon            = channel === 'email' ? Mail : MessageCircle;
  const title           = channel === 'email' ? 'Verifique seu e-mail' : 'Verifique seu WhatsApp';
  const channelLabel    = channel === 'email' ? 'e-mail' : 'WhatsApp';

  const [digits, setDigits]       = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown
  useEffect(() => {
    if (canResend) return;
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, canResend]);

  const fullCode   = digits.join('');
  const isComplete = fullCode.length === 6;

  // ── Digit handlers ───────────────────────────────────

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]; next[index] = ''; setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft'  && index > 0) inputRefs.current[index - 1]?.focus();
    else if   (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    setError(null);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  }

  // ── Submit ───────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isComplete) return;
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    // TODO: integração pendente — aceita qualquer código no protótipo.
    onNavigate?.();
  }

  // ── Resend ───────────────────────────────────────────

  function handleResend() {
    if (!canResend) return;
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    setDigits(Array(6).fill(''));
    setError(null);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  // ── Render ───────────────────────────────────────────

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={styles.card}>

          {/* Ícone */}
          <div className={styles.iconWrap}>
            <Icon size={28} strokeWidth={1.5} />
          </div>

          {/* Texto */}
          <div className={styles.textBlock}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>
              Enviamos um código de 6 dígitos para o seu {channelLabel}{' '}
              <strong>{resolvedContact}</strong>.
            </p>
          </div>

          {/* OTP form */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {/* Boxes */}
            <div className={styles.otpRow} onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  className={[
                    styles.otpBox,
                    d     ? styles.otpBoxFilled : '',
                    error ? styles.otpBoxError  : '',
                  ].filter(Boolean).join(' ')}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={loading}
                  autoFocus={i === 0}
                  autoComplete="one-time-code"
                  aria-label={`Dígito ${i + 1}`}
                />
              ))}
            </div>

            {/* Erro */}
            {error && <Feedback type="error" message={error} />}

            {/* Reenviar */}
            <div className={styles.resendArea}>
              <span className={styles.resendText}>Não recebeu o código?</span>
              {canResend ? (
                <button type="button" className={styles.resendBtn} onClick={handleResend}>
                  Reenviar código
                </button>
              ) : (
                <span className={styles.resendTimer}>Reenviar em {countdown}s</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              disabled={!isComplete || loading}
              iconLeft={loading ? <span className={styles.spinner}><Loader2 size={18} /></span> : undefined}
            >
              {loading ? 'Verificando...' : 'Confirmar'}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
