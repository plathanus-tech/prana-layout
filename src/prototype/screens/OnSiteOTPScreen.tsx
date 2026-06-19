/**
 * OnSiteOTPScreen — Código OTP via WhatsApp
 * Jornada: Agendamento no Local
 *
 * Wrapper fino sobre LinkOTPScreen com channel="whatsapp".
 * Toda a lógica, layout e comportamento são idênticos
 * à jornada de Agendamento via Link do Beneficiário.
 */

import { LinkOTPScreen } from './LinkOTPScreen';

const DEMO_WHATSAPP = '+55 (11) 9 9999-9999';

interface OnSiteOTPScreenProps {
  viewport?: 'mobile' | 'desktop';
  phone?: string;
  onNavigate?: () => void;
}

export function OnSiteOTPScreen({
  viewport = 'desktop',
  phone = DEMO_WHATSAPP,
  onNavigate,
}: OnSiteOTPScreenProps) {
  return (
    <LinkOTPScreen
      viewport={viewport}
      channel="whatsapp"
      contact={phone}
      onNavigate={onNavigate}
    />
  );
}
