import { useState, useEffect } from 'react';
import { ProfessionalSurveyFormScreen } from './ProfessionalSurveyFormScreen';
import { ProfessionalSurveySuccessScreen, type ProfessionalSurveySuccessVariant } from './ProfessionalSurveySuccessScreen';
import { ProfessionalSurveyBlockedScreen } from './ProfessionalSurveyBlockedScreen';

// ─── Tipos ──────────────────────────────────────────────────────────────────
export interface EventSurvey {
  id: string;
  eventName: string;
  eventDate: string;
  location: string;
  respondedBy?: string; // Nome do profissional que respondeu (se já respondida)
  respondedAt?: string; // Data de resposta (se já respondida)
}

export type ProfessionalSurveyView = 'form' | 'success' | 'blocked';

// ─── Component ───────────────────────────────────────────────────────────────

interface ProfessionalSurveyScreenProps {
  viewport?: 'mobile' | 'desktop';
  survey: EventSurvey;
  alreadyResponded?: boolean;
  respondentName?: string;
  forceView?: ProfessionalSurveyView; // Para prototipagem: força uma tela específica
  forceSuccessVariant?: ProfessionalSurveySuccessVariant; // Para prototipagem: força a variante de sucesso
}

export function ProfessionalSurveyScreen({
  viewport = 'desktop',
  survey,
  alreadyResponded = false,
  respondentName = 'Ana Silva',
  forceView,
  forceSuccessVariant,
}: ProfessionalSurveyScreenProps) {
  const [currentView, setCurrentView] = useState<ProfessionalSurveyView>(
    forceView || (alreadyResponded ? 'blocked' : 'form')
  );
  const [successVariant, setSuccessVariant] = useState<ProfessionalSurveySuccessVariant>(forceSuccessVariant || 'positive');

  // Atualizar estado quando forceView muda
  useEffect(() => {
    if (forceView) {
      setCurrentView(forceView);
    }
  }, [forceView]);

  // Atualizar sucesso quando forceSuccessVariant muda
  useEffect(() => {
    if (forceSuccessVariant) {
      setSuccessVariant(forceSuccessVariant);
    }
  }, [forceSuccessVariant]);

  function handleFormSubmit(variant: ProfessionalSurveySuccessVariant) {
    setSuccessVariant(variant);
    setCurrentView('success');
  }

  // Renderizar baseado no estado atual
  if (currentView === 'blocked') {
    return (
      <ProfessionalSurveyBlockedScreen
        viewport={viewport}
        respondentName={respondentName}
      />
    );
  }

  if (currentView === 'success') {
    return (
      <ProfessionalSurveySuccessScreen
        viewport={viewport}
        variant={successVariant}
      />
    );
  }

  // Form view (padrão)
  return (
    <ProfessionalSurveyFormScreen
      viewport={viewport}
      eventName={survey.eventName}
      onNavigate={handleFormSubmit}
    />
  );
}
