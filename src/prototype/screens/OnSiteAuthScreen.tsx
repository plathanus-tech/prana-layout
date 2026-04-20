import { useState, ChangeEvent, FormEvent } from 'react';
import { Loader2, Info } from 'lucide-react';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { AppHeader } from '../components/AppHeader';
import styles from './OnSiteAuthScreen.module.css';

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Fields {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
}

interface OnSiteAuthScreenProps {
  viewport?: 'mobile' | 'desktop';
  onNavigate?: (screen: 'onsite-otp') => void;
}

export function OnSiteAuthScreen({ viewport = 'desktop', onNavigate }: OnSiteAuthScreenProps) {
  const isDesktop = viewport === 'desktop';

  const [fields, setFields] = useState<Fields>({ nome: '', email: '', telefone: '', empresa: '' });
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    let processed = value;
    if (name === 'telefone') processed = maskPhone(value);

    setFields(prev => ({ ...prev, [name]: processed }));
    if (errors[name as keyof Fields]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): Partial<Fields> {
    const errs: Partial<Fields> = {};
    if (!fields.nome.trim()) errs.nome = 'Campo obrigatório';
    if (!fields.email.trim()) {
      errs.email = 'Campo obrigatório';
    } else if (!EMAIL_RE.test(fields.email)) {
      errs.email = 'Por favor, utilize um formato de e-mail válido. Exemplo: exemplo@dominio.com.br';
    }
    if (!fields.telefone.trim()) {
      errs.telefone = 'Campo obrigatório';
    } else if (fields.telefone.replace(/\D/g, '').length < 10) {
      errs.telefone = 'Telefone inválido';
    }
    if (!fields.empresa.trim()) errs.empresa = 'Campo obrigatório';
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    setLoading(false);
    onNavigate?.('onsite-otp');
  }

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={styles.card}>

          <div className={styles.header}>
            <h1 className={styles.title}>Seus dados</h1>
            <p className={styles.subtitle}>Preencha para confirmar o agendamento.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.inputsGroup}>
              <Input
                label="Nome completo"
                name="nome"
                type="text"
                placeholder="Ex: Maria Silva"
                value={fields.nome}
                onChange={handleChange}
                error={errors.nome}
                autoComplete="name"
                disabled={loading}
              />
              <Input
                label="E-mail"
                name="email"
                type="email"
                placeholder="Ex: maria@empresa.com.br"
                value={fields.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
                disabled={loading}
              />
              <Input
                label="Telefone"
                name="telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={fields.telefone}
                onChange={handleChange}
                error={errors.telefone}
                autoComplete="tel"
                disabled={loading}
                inputMode="numeric"
              />
              <Input
                label="Empresa"
                name="empresa"
                type="text"
                placeholder="Ex: Plathanus"
                value={fields.empresa}
                onChange={handleChange}
                error={errors.empresa}
                autoComplete="organization"
                disabled={loading}
              />
            </div>

            {/* Aviso OTP */}
            <div className={styles.otpNotice}>
              <Info size={14} className={styles.otpNoticeIcon} />
              <span>Vamos enviar um código de confirmação para o seu e-mail.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              
              disabled={loading}
              iconLeft={loading ? <span className={styles.spinner}><Loader2 size={18} /></span> : undefined}
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
