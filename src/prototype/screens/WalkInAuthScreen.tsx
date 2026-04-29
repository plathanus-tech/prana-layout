/**
 * WalkInAuthScreen — Dados do cliente (Encaixe)
 * Jornada: Encaixe (Beneficiário)
 *
 * Layout idêntico ao OnSiteAuthScreen.
 * Diferenças específicas do encaixe:
 *  - Subtítulo contextualiza o serviço sendo encaixado
 *  - Sem campo de telefone
 *  - Sem aviso de envio de OTP
 *  - Botão "Confirmar encaixe"
 *  - Navega diretamente para sucesso após submit
 */

import { useState, ChangeEvent, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { AppHeader } from '../components/AppHeader';
import styles from './OnSiteAuthScreen.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Fields {
  nome:    string;
  email:   string;
  empresa: string;
}

interface WalkInAuthScreenProps {
  viewport?:    'mobile' | 'desktop';
  /** Nome do serviço sendo encaixado. Exibido no subtítulo. */
  serviceName?: string;
  onNavigate?:  () => void;
}

export function WalkInAuthScreen({
  viewport    = 'desktop',
  serviceName = 'Quick Massage',
  onNavigate,
}: WalkInAuthScreenProps) {
  const isDesktop = viewport === 'desktop';

  const [fields, setFields] = useState<Fields>({ nome: '', email: '', empresa: '' });
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
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
    onNavigate?.();
  }

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={styles.card}>

          <div className={styles.header}>
            <h1 className={styles.title}>Seus dados</h1>
            <p className={styles.subtitle}>
              Você está realizando um encaixe para o serviço de{' '}
              <strong>{serviceName}</strong>.
            </p>
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              disabled={loading}
              iconLeft={loading ? <span className={styles.spinner}><Loader2 size={18} /></span> : undefined}
            >
              {loading ? 'Confirmando...' : 'Confirmar encaixe'}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
