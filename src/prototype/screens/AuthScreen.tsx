import { useState, ChangeEvent, FormEvent } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Feedback } from '../../components/Feedback/Feedback';
import { RadioButton } from '../../components/RadioButton/RadioButton';
import { Dropdown } from '../../components/Dropdown/Dropdown';
import styles from './AuthScreen.module.css';

const EMPRESA_TERCEIRIZADA_OPTIONS = [
  { label: 'Sim', value: 'sim' },
  { label: 'Não', value: 'nao' },
];

const AREA_OPTIONS = [
  { label: 'Gestor',     value: 'gestor'     },
  { label: 'RH',        value: 'rh'         },
  { label: 'Financeiro', value: 'financeiro' },
  { label: 'Operações', value: 'operacoes'  },
  { label: 'Outros',    value: 'outros'     },
];

interface FormFields {
  empresaTerceirizada: string;
  nomeEmpresa: string;
  nome: string;
  area: string;
  areaOutros: string;
  email: string;
  telefone: string;
  codigoEmpresa: string;
}

interface FormErrors {
  empresaTerceirizada?: string;
  nomeEmpresa?: string;
  nome?: string;
  area?: string;
  areaOutros?: string;
  email?: string;
  telefone?: string;
  codigoEmpresa?: string;
}

// Applies (XX) XXXXX-XXXX mask
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simulated valid codes (anything except "INVALIDO")
const INVALID_CODE = 'INVALIDO';

interface AuthScreenProps {
  viewport?: 'mobile' | 'desktop';
  onNavigate?: (screen: 'select-e') => void;
}

export function AuthScreen({ viewport = 'desktop', onNavigate }: AuthScreenProps) {
  const [fields, setFields] = useState<FormFields>({
    empresaTerceirizada: '',
    nomeEmpresa: '',
    nome: '',
    area: '',
    areaOutros: '',
    email: '',
    telefone: '',
    codigoEmpresa: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    let processed = value;

    if (name === 'telefone') processed = maskPhone(value);
    if (name === 'codigoEmpresa') processed = value.toUpperCase();

    setFields(prev => ({ ...prev, [name]: processed }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError(null);
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!fields.empresaTerceirizada) errs.empresaTerceirizada = 'Campo obrigatório';
    if (fields.empresaTerceirizada === 'sim' && !fields.nomeEmpresa.trim()) errs.nomeEmpresa = 'Campo obrigatório';
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
    if (!fields.codigoEmpresa.trim()) errs.codigoEmpresa = 'Campo obrigatório';

    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setServerError(null);

    await new Promise(res => setTimeout(res, 1500));

    setLoading(false);

    if (fields.codigoEmpresa === INVALID_CODE) {
      setServerError('Código da empresa não encontrado. Verifique com o seu RH.');
    } else {
      onNavigate?.('select-e');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <img
          src={`${import.meta.env.BASE_URL}logos/PRANA_ENXOVAL__LOGO_Eventos_2_Magenta.svg`}
          alt="Espaço Prana"
          className={[styles.logo, viewport === 'mobile' ? styles.logoMobile : ''].filter(Boolean).join(' ')}
        />
        <div className={styles.header}>
          <h1 className={styles.title}>É bom ter você por aqui</h1>
          <p className={styles.subtitle}>
            Informe seus dados para acessar o agendamento
          </p>
        </div>

        {/* Form — gap:24px entre inputs e botão */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Inputs group — gap:16px entre campos */}
          <div className={styles.inputsGroup}>
            <RadioButton
              label="Empresa terceirizada"
              name="empresaTerceirizada"
              options={EMPRESA_TERCEIRIZADA_OPTIONS}
              value={fields.empresaTerceirizada}
              onChange={val => {
                setFields(prev => ({ ...prev, empresaTerceirizada: val, nomeEmpresa: '' }));
                if (errors.empresaTerceirizada) setErrors(prev => ({ ...prev, empresaTerceirizada: undefined }));
              }}
              orientation="horizontal"
              disabled={loading}
            />
            {errors.empresaTerceirizada && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-error)', marginTop: -8 }}>{errors.empresaTerceirizada}</span>}
            {fields.empresaTerceirizada === 'sim' && (
              <Input
                label="Nome da empresa"
                name="nomeEmpresa"
                type="text"
                placeholder="Ex: Empresa ABC"
                value={fields.nomeEmpresa}
                onChange={handleChange}
                error={errors.nomeEmpresa}
                disabled={loading}
              />
            )}
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
            <Dropdown
              label="Área"
              options={AREA_OPTIONS}
              value={fields.area}
              placeholder="Selecione sua área"
              onChange={val => {
                setFields(prev => ({ ...prev, area: val, areaOutros: '' }));
                if (errors.area) setErrors(prev => ({ ...prev, area: undefined }));
              }}
              error={errors.area}
              disabled={loading}
            />
            {fields.area === 'outros' && (
              <Input
                label="Qual área?"
                name="areaOutros"
                type="text"
                placeholder="Informe sua área"
                value={fields.areaOutros}
                onChange={handleChange}
                error={errors.areaOutros}
                disabled={loading}
              />
            )}
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
              label="Código do evento"
              name="codigoEmpresa"
              type="text"
              placeholder="Ex: PRANA123"
              value={fields.codigoEmpresa}
              onChange={handleChange}
              error={errors.codigoEmpresa}
              helperText="Enviado pelo RH no e-mail de convite."
              disabled={loading}
            />
          </div>

          {/* Feedback + botão — separados 24px dos inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {serverError && (
              <Feedback type="error" message={serverError} />
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"

              disabled={loading}
              iconLeft={
                loading
                  ? <span className={styles.spinner}><Loader2 size={18} /></span>
                  : undefined
              }
            >
              {loading ? 'Validando...' : 'Continuar'}
            </Button>
            <div className={styles.privacyNote}>
              <Lock size={12} />
              <span>Seus dados são tratados com segurança e utilizados exclusivamente para agendamento e notificações sobre o evento, conforme a LGPD.</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
