// TELA: Login — Admin e Empresa
// ROLES COM ACESSO: adm, empresa
// TELAS: login | recuperar | nova-senha

import { useState, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '../../../components/Input/Input';
import { Button } from '../../../components/Button/Button';
import { Feedback } from '../../../components/Feedback/Feedback';
import styles from './AdminLoginScreen.module.css';

export type LoginView = 'login' | 'recuperar' | 'nova-senha';

const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mock: qualquer combinação com este e-mail = credenciais inválidas
const INVALID_EMAIL = 'teste@mail.com';

// ─── Toggle mostrar/ocultar senha ────────────────────────────────────────────
function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={styles.eyeBtn}
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
    >
      {/* eye = senha visível / eye-off = senha oculta */}
      {show ? <Eye size={16} /> : <EyeOff size={16} />}
    </button>
  );
}

// ─── Tela 1 — Login ───────────────────────────────────────────────────────────
function LoginScreen({ onNavigate, onLoginSuccess }: { onNavigate: (v: LoginView) => void; onLoginSuccess?: () => void }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [passErr,  setPassErr]  = useState('');
  const [serverErr, setServerErr] = useState('');
  const [loading,  setLoading]  = useState(false);

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (emailErr)   setEmailErr('');
    if (serverErr)  setServerErr('');
  }

  function handlePassChange(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    if (passErr)    setPassErr('');
    if (serverErr)  setServerErr('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    let hasError = false;

    if (!email.trim()) {
      setEmailErr('Campo obrigatório');
      hasError = true;
    } else if (!EMAIL_RE.test(email)) {
      setEmailErr('Por favor, utilize um formato de e-mail válido. Exemplo: exemplo@dominio.com.br');
      hasError = true;
    }

    if (!password.trim()) {
      setPassErr('Campo obrigatório');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    await new Promise(res => setTimeout(res, 1200));
    setLoading(false);

    if (email === INVALID_EMAIL) {
      // Força borda vermelha em ambos os campos (espaço = truthy sem mensagem visível)
      setEmailErr(' ');
      setPassErr(' ');
      setServerErr(
        'Usuário ou senha incorretos. Esqueceu a sua senha? Clique em "Recuperar minha senha" para recuperá-la.'
      );
    } else {
      // Credenciais válidas → navega para o Dashboard
      onLoginSuccess?.();
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img
          src={`${import.meta.env.BASE_URL}logos/PRANA_ENXOVAL__LOGO_Eventos_2_Magenta.svg`}
          alt="Prana"
          className={styles.logo}
        />
        <div className={styles.header}>
          <h1 className={styles.title}>É bom ter você por aqui</h1>
          <p className={styles.subtitle}>Informe seus dados para acessar o sistema</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputsGroup}>
            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="Ex: nome@empresa.com.br"
              value={email}
              onChange={handleEmailChange}
              error={emailErr || undefined}
              hideErrorIcon
              autoComplete="email"
              disabled={loading}
            />
            <Input
              label="Senha"
              name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••••"
              value={password}
              onChange={handlePassChange}
              error={passErr || undefined}
              hideErrorIcon
              autoComplete="current-password"
              disabled={loading}
              iconRight={<EyeToggle show={showPass} onToggle={() => setShowPass(s => !s)} />}
            />
            <label className={styles.rememberLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                disabled={loading}
              />
              Lembrar-me
            </label>
          </div>

          <div className={styles.actionsGroup}>
            {serverErr && <Feedback type="error" message={serverErr} />}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              iconLeft={loading ? <span className={styles.spinner}><Loader2 size={18} /></span> : undefined}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => onNavigate('recuperar')}
              disabled={loading}
            >
              Recuperar minha senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tela 2 — Recuperar senha ─────────────────────────────────────────────────
function RecuperarSenhaScreen({ onNavigate }: { onNavigate: (v: LoginView) => void }) {
  const [email,    setEmail]    = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (emailErr) setEmailErr('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setEmailErr('Campo obrigatório');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setEmailErr('Por favor, utilize um formato de e-mail válido. Exemplo: exemplo@dominio.com.br');
      return;
    }

    setLoading(true);
    await new Promise(res => setTimeout(res, 1200));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img
          src={`${import.meta.env.BASE_URL}logos/PRANA_ENXOVAL__LOGO_Eventos_2_Magenta.svg`}
          alt="Prana"
          className={styles.logo}
        />
        <div className={styles.header}>
          <h1 className={styles.title}>Recuperar minha senha</h1>
          <p className={styles.subtitle}>
            Informe seu e-mail para receber as orientações de redefinição de senha
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputsGroup}>
            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="Ex: nome@empresa.com.br"
              value={email}
              onChange={handleEmailChange}
              error={emailErr || undefined}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className={styles.actionsGroup}>
            {sent && (
              <Feedback
                type="success"
                message="Enviamos as instruções para o seu e-mail. Verifique sua caixa de entrada."
              />
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              iconLeft={loading ? <span className={styles.spinner}><Loader2 size={18} /></span> : undefined}
            >
              {loading ? 'Enviando...' : 'Recuperar senha'}
            </Button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => onNavigate('login')}
              disabled={loading}
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tela 3 — Criar nova senha ────────────────────────────────────────────────
function NovaSenhaScreen({ onNavigate }: { onNavigate: (v: LoginView) => void }) {
  const [nova,      setNova]      = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showNova,  setShowNova]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [novaErr,   setNovaErr]   = useState('');
  const [confErr,   setConfErr]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  function handleNovaChange(e: ChangeEvent<HTMLInputElement>) {
    setNova(e.target.value);
    if (novaErr) setNovaErr('');
  }

  function handleConfChange(e: ChangeEvent<HTMLInputElement>) {
    setConfirmar(e.target.value);
    if (confErr) setConfErr('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    let hasError = false;

    if (!nova.trim()) {
      setNovaErr('Campo obrigatório');
      hasError = true;
    } else if (nova.length < 10) {
      setNovaErr('A senha deve ter pelo menos 10 caracteres');
      hasError = true;
    }

    if (!confirmar.trim()) {
      setConfErr('Campo obrigatório');
      hasError = true;
    } else if (nova && confirmar !== nova) {
      setConfErr('As senhas não correspondem');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    await new Promise(res => setTimeout(res, 1200));
    setLoading(false);
    setSuccess(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img
          src={`${import.meta.env.BASE_URL}logos/PRANA_ENXOVAL__LOGO_Eventos_2_Magenta.svg`}
          alt="Prana"
          className={styles.logo}
        />
        <div className={styles.header}>
          <h1 className={styles.title}>Criar nova senha</h1>
          <p className={styles.subtitle}>
            Digite e confirme sua nova senha para finalizar a redefinição
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputsGroup}>
            <Input
              label="Nova senha"
              name="nova"
              type={showNova ? 'text' : 'password'}
              placeholder="••••••••••"
              value={nova}
              onChange={handleNovaChange}
              error={novaErr || undefined}
              helperText={!novaErr ? 'Mínimo de 10 caracteres' : undefined}
              disabled={loading}
              iconRight={<EyeToggle show={showNova} onToggle={() => setShowNova(s => !s)} />}
            />
            <Input
              label="Confirmar nova senha"
              name="confirmar"
              type={showConf ? 'text' : 'password'}
              placeholder="••••••••••"
              value={confirmar}
              onChange={handleConfChange}
              error={confErr || undefined}
              disabled={loading}
              iconRight={<EyeToggle show={showConf} onToggle={() => setShowConf(s => !s)} />}
            />
          </div>

          <div className={styles.actionsGroup}>
            {success && (
              <Feedback type="success" message="Senha redefinida com sucesso!" />
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              iconLeft={loading ? <span className={styles.spinner}><Loader2 size={18} /></span> : undefined}
            >
              {loading ? 'Salvando...' : 'Criar nova senha'}
            </Button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => onNavigate('login')}
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export interface AdminLoginScreenProps {
  /** Vista controlada pelo shell externo (sidebar do protótipo). */
  view?: LoginView;
  /** Notifica o shell quando a navegação interna muda de vista. */
  onViewChange?: (v: LoginView) => void;
  /** Chamado após login bem-sucedido — navega para o Dashboard no shell. */
  onLoginSuccess?: () => void;
}

export function AdminLoginScreen({ view: externalView, onViewChange, onLoginSuccess }: AdminLoginScreenProps) {
  const [internalView, setInternalView] = useState<LoginView>(externalView ?? 'login');
  const currentView = externalView ?? internalView;

  function navigate(v: LoginView) {
    setInternalView(v);
    onViewChange?.(v);
  }

  if (currentView === 'recuperar')  return <RecuperarSenhaScreen onNavigate={navigate} />;
  if (currentView === 'nova-senha') return <NovaSenhaScreen      onNavigate={navigate} />;
  return <LoginScreen onNavigate={navigate} onLoginSuccess={onLoginSuccess} />;
}
