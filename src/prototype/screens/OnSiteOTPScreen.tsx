/**
 * OnSiteOTPScreen — Código OTP via e-mail
 * Jornada: Agendamento no Local
 *
 * Wrapper fino sobre LinkOTPScreen com channel="email".
 * Toda a lógica, layout e comportamento são idênticos
 * à jornada de Agendamento via Link do Beneficiário.
 */

import { LinkOTPScreen } from './LinkOTPScreen';

const DEMO_EMAIL = 'maria@empresa.com.br';

interface OnSiteOTPScreenProps {
  viewport?: 'mobile' | 'desktop';
  email?: string;
  onNavigate?: () => void;
}

export function OnSiteOTPScreen({
  viewport = 'desktop',
  email = DEMO_EMAIL,
  onNavigate,
}: OnSiteOTPScreenProps) {
  return (
    <LinkOTPScreen
      viewport={viewport}
      channel="email"
      contact={email}
      onNavigate={onNavigate}
    />
  );
}
