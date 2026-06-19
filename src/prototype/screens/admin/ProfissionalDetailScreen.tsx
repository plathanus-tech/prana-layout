// TELA: Detalhe do Profissional (Admin only)
// ROLES COM ACESSO: adm
// PERMISSÕES:
//   adm → visualizar dados completos, histórico de eventos e avaliações

import { useState } from 'react';
import { ArrowLeft, Star, ChevronDown, TrendingUp, Search } from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import type { UserRole } from './UsersScreen';
import type { Profissional } from './ProfissionaisScreen';
import styles from './ProfissionalDetailScreen.module.css';
import tooltipStyles from '../../../components/Tooltip/Tooltip.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type DetailTab = 'dados' | 'avaliacoes';

interface EvalData {
  radarDimensions: Array<{ axis: string; value: number }>; // 0–10
  servicoRatings:  Array<{ name: string; rating: number }>; // 0–10 → exibido como 0–5
}

interface EventoRealizado {
  eventId:   string;
  eventName: string;
  company:   string;
  date:      string;   // 'DD/MM/YYYY'
  servico:   string;
  avaliacao: number;   // 1–5
  evalData?: EvalData;
}

interface Endereco {
  cep:         string;
  logradouro:  string;
  numero:      string;
  complemento: string;
  bairro:      string;
  cidade:      string;
  estado:      string;
}

interface ProfissionalDetailData {
  telefone:     string;
  sexo:         'Masculino' | 'Feminino';
  tipoCadastro: 'PF' | 'PJ';
  endereco:     Endereco;
  eventHistory: EventoRealizado[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_DETAIL: Record<string, ProfissionalDetailData> = {
  'PRO-001': {
    telefone: '(11) 98765-4321', sexo: 'Feminino', tipoCadastro: 'PJ',
    endereco: { cep: '01310-100', logradouro: 'Av. Paulista', numero: '1374', complemento: 'Conj. 82', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
    eventHistory: [
      {
        eventId: 'EVT-001', eventName: 'SIPAT – Itaú Unibanco', company: 'Itaú Unibanco',
        date: '13/04/2026', servico: 'Quick Massage', avaliacao: 5.0,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 9.5 }, { axis: 'Relaxamento', value: 9.8 },
            { axis: 'Foco', value: 8.7 },      { axis: 'Engajamento', value: 9.2 },
            { axis: 'Clima', value: 9.6 },
          ],
          servicoRatings: [{ name: 'Quick Massage', rating: 9.7 }],
        },
      },
      {
        eventId: 'EVT-003', eventName: 'Dia de Saúde – Ambev', company: 'Ambev',
        date: '20/05/2026', servico: 'Quick Massage', avaliacao: 4.8,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 9.1 }, { axis: 'Relaxamento', value: 9.3 },
            { axis: 'Foco', value: 8.4 },      { axis: 'Engajamento', value: 8.9 },
            { axis: 'Clima', value: 9.0 },
          ],
          servicoRatings: [{ name: 'Quick Massage', rating: 9.3 }],
        },
      },
      {
        eventId: 'EVT-005', eventName: 'Ginástica Laboral – Bradesco', company: 'Bradesco',
        date: '10/03/2026', servico: 'Quick Massage', avaliacao: 4.9,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 9.3 }, { axis: 'Relaxamento', value: 9.5 },
            { axis: 'Foco', value: 8.5 },      { axis: 'Engajamento', value: 9.0 },
            { axis: 'Clima', value: 9.2 },
          ],
          servicoRatings: [{ name: 'Quick Massage', rating: 9.5 }],
        },
      },
      {
        eventId: 'EVT-VVO', eventName: 'Bem-Estar – Vivo', company: 'Vivo',
        date: '15/02/2026', servico: 'Quick Massage', avaliacao: 4.7,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.9 }, { axis: 'Relaxamento', value: 9.0 },
            { axis: 'Foco', value: 8.2 },      { axis: 'Engajamento', value: 8.6 },
            { axis: 'Clima', value: 8.8 },
          ],
          servicoRatings: [{ name: 'Quick Massage', rating: 9.1 }],
        },
      },
      {
        eventId: 'EVT-MAG', eventName: 'Saúde & Qualidade – Magalu', company: 'Magazine Luiza',
        date: '05/01/2026', servico: 'Quick Massage', avaliacao: 4.6,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.7 }, { axis: 'Relaxamento', value: 8.8 },
            { axis: 'Foco', value: 8.0 },      { axis: 'Engajamento', value: 8.4 },
            { axis: 'Clima', value: 8.6 },
          ],
          servicoRatings: [{ name: 'Quick Massage', rating: 8.9 }],
        },
      },
    ],
  },
  'PRO-002': {
    telefone: '(21) 97654-3210', sexo: 'Masculino', tipoCadastro: 'PF',
    endereco: { cep: '22071-060', logradouro: 'Rua Visconde de Pirajá', numero: '550', complemento: 'Sala 1101', bairro: 'Ipanema', cidade: 'Rio de Janeiro', estado: 'RJ' },
    eventHistory: [
      {
        eventId: 'EVT-001', eventName: 'SIPAT – Itaú Unibanco', company: 'Itaú Unibanco',
        date: '13/04/2026', servico: 'Acupuntura', avaliacao: 4.7,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.8 }, { axis: 'Relaxamento', value: 9.0 },
            { axis: 'Foco', value: 8.2 },      { axis: 'Engajamento', value: 8.5 },
            { axis: 'Clima', value: 8.9 },
          ],
          servicoRatings: [{ name: 'Acupuntura', rating: 9.2 }],
        },
      },
      {
        eventId: 'EVT-REC', eventName: 'Saúde Total – Petrobras', company: 'Petrobras',
        date: '22/03/2026', servico: 'Acupuntura', avaliacao: 4.5,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.5 }, { axis: 'Relaxamento', value: 8.7 },
            { axis: 'Foco', value: 7.9 },      { axis: 'Engajamento', value: 8.2 },
            { axis: 'Clima', value: 8.6 },
          ],
          servicoRatings: [{ name: 'Acupuntura', rating: 9.0 }],
        },
      },
      {
        eventId: 'EVT-GOL', eventName: 'Bem-Estar – Gol Linhas Aéreas', company: 'Gol',
        date: '10/01/2026', servico: 'Acupuntura', avaliacao: 4.4,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.3 }, { axis: 'Relaxamento', value: 8.5 },
            { axis: 'Foco', value: 7.7 },      { axis: 'Engajamento', value: 8.0 },
            { axis: 'Clima', value: 8.4 },
          ],
          servicoRatings: [{ name: 'Acupuntura', rating: 8.8 }],
        },
      },
    ],
  },
  'PRO-003': {
    telefone: '(11) 96543-2109', sexo: 'Feminino', tipoCadastro: 'PF',
    endereco: { cep: '04548-050', logradouro: 'Av. Brigadeiro Faria Lima', numero: '2232', complemento: 'Apto 71', bairro: 'Jardim Paulistano', cidade: 'São Paulo', estado: 'SP' },
    eventHistory: [
      {
        eventId: 'EVT-001', eventName: 'SIPAT – Itaú Unibanco', company: 'Itaú Unibanco',
        date: '13/04/2026', servico: 'Podologia', avaliacao: 4.5,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.4 }, { axis: 'Relaxamento', value: 8.6 },
            { axis: 'Foco', value: 7.8 },      { axis: 'Engajamento', value: 8.1 },
            { axis: 'Clima', value: 8.5 },
          ],
          servicoRatings: [{ name: 'Podologia', rating: 8.7 }],
        },
      },
      {
        eventId: 'EVT-NAT', eventName: 'Natura Saúde & Bem-Estar', company: 'Natura',
        date: '01/03/2026', servico: 'Podologia', avaliacao: 4.3,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.2 }, { axis: 'Relaxamento', value: 8.3 },
            { axis: 'Foco', value: 7.5 },      { axis: 'Engajamento', value: 7.9 },
            { axis: 'Clima', value: 8.2 },
          ],
          servicoRatings: [{ name: 'Podologia', rating: 8.4 }],
        },
      },
      {
        eventId: 'EVT-REN', eventName: 'Renner – Dia da Mulher', company: 'Renner',
        date: '08/03/2026', servico: 'Podologia', avaliacao: 4.2,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.0 }, { axis: 'Relaxamento', value: 8.1 },
            { axis: 'Foco', value: 7.4 },      { axis: 'Engajamento', value: 7.7 },
            { axis: 'Clima', value: 8.0 },
          ],
          servicoRatings: [{ name: 'Podologia', rating: 8.2 }],
        },
      },
      {
        eventId: 'EVT-MAR', eventName: 'Saúde Corporativa – Marisa', company: 'Marisa',
        date: '18/12/2025', servico: 'Podologia', avaliacao: 4.5,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.5 }, { axis: 'Relaxamento', value: 8.6 },
            { axis: 'Foco', value: 7.9 },      { axis: 'Engajamento', value: 8.2 },
            { axis: 'Clima', value: 8.4 },
          ],
          servicoRatings: [{ name: 'Podologia', rating: 8.8 }],
        },
      },
    ],
  },
  'PRO-004': {
    telefone: '(41) 95432-1098', sexo: 'Masculino', tipoCadastro: 'PJ',
    endereco: { cep: '80020-030', logradouro: 'Rua XV de Novembro', numero: '800', complemento: '', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR' },
    eventHistory: [
      {
        eventId: 'EVT-VVC', eventName: 'Vivo – Saúde Corporativa', company: 'Vivo',
        date: '18/04/2026', servico: 'Fisioterapia', avaliacao: 4.8,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 9.0 }, { axis: 'Relaxamento', value: 9.1 },
            { axis: 'Foco', value: 8.8 },      { axis: 'Engajamento', value: 8.9 },
            { axis: 'Clima', value: 9.2 },
          ],
          servicoRatings: [{ name: 'Fisioterapia', rating: 9.4 }],
        },
      },
      {
        eventId: 'EVT-WEG', eventName: 'WEG Saúde & Performance', company: 'WEG',
        date: '05/02/2026', servico: 'Fisioterapia', avaliacao: 4.5,
        evalData: {
          radarDimensions: [
            { axis: 'Bem-estar', value: 8.6 }, { axis: 'Relaxamento', value: 8.8 },
            { axis: 'Foco', value: 8.4 },      { axis: 'Engajamento', value: 8.5 },
            { axis: 'Clima', value: 8.9 },
          ],
          servicoRatings: [{ name: 'Fisioterapia', rating: 9.0 }],
        },
      },
    ],
  },
  'PRO-005': {
    telefone: '(31) 94321-0987', sexo: 'Feminino', tipoCadastro: 'PF',
    endereco: { cep: '30112-000', logradouro: 'Av. Afonso Pena', numero: '1500', complemento: 'Bloco B, Sala 203', bairro: 'Centro', cidade: 'Belo Horizonte', estado: 'MG' },
    eventHistory: [
      { eventId: 'EVT-BTG', eventName: 'BTG – Saúde no Trabalho', company: 'BTG Pactual', date: '12/04/2026', servico: 'Quick Massage', avaliacao: 4.3 },
      { eventId: 'EVT-NUB', eventName: 'Nubank Day – Bem-Estar',  company: 'Nubank',      date: '02/03/2026', servico: 'Quick Massage', avaliacao: 4.4 },
    ],
  },
  'PRO-006': {
    telefone: '(11) 93210-9876', sexo: 'Masculino', tipoCadastro: 'PF',
    endereco: { cep: '01415-001', logradouro: 'Rua Augusta', numero: '2345', complemento: 'Apto 12', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP' },
    eventHistory: [
      { eventId: 'EVT-XPE', eventName: 'XP Inc – Saúde Corporativa', company: 'XP Inc',  date: '10/04/2026', servico: 'Terapia', avaliacao: 4.0 },
      { eventId: 'EVT-STO', eventName: 'Stone – Bem-Estar',          company: 'Stone',    date: '14/02/2026', servico: 'Terapia', avaliacao: 4.2 },
    ],
  },
  'PRO-007': {
    telefone: '(48) 92109-8765', sexo: 'Feminino', tipoCadastro: 'PJ',
    endereco: { cep: '88015-200', logradouro: 'Rua Felipe Schmidt', numero: '320', complemento: 'Sala 5', bairro: 'Centro', cidade: 'Florianópolis', estado: 'SC' },
    eventHistory: [
      { eventId: 'EVT-EMB', eventName: 'Embraer – Saúde no Trabalho', company: 'Embraer', date: '15/04/2026', servico: 'Acupuntura', avaliacao: 4.9 },
      { eventId: 'EVT-TOT', eventName: 'Totvs – Dia Saúde',           company: 'Totvs',   date: '01/04/2026', servico: 'Acupuntura', avaliacao: 4.7 },
    ],
  },
  'PRO-008': {
    telefone: '(19) 91098-7654', sexo: 'Masculino', tipoCadastro: 'PF',
    endereco: { cep: '13010-111', logradouro: 'Av. Francisco Glicério', numero: '935', complemento: '', bairro: 'Centro', cidade: 'Campinas', estado: 'SP' },
    eventHistory: [
      { eventId: 'EVT-SBR', eventName: 'Santander – Bem-Estar', company: 'Santander', date: '09/04/2026', servico: 'Quiropraxia', avaliacao: 4.0 },
    ],
  },
  'PRO-009': {
    telefone: '(71) 90987-6543', sexo: 'Feminino', tipoCadastro: 'PF',
    endereco: { cep: '40020-020', logradouro: 'Av. Sete de Setembro', numero: '2100', complemento: 'Apto 302', bairro: 'Vitória', cidade: 'Salvador', estado: 'BA' },
    eventHistory: [
      { eventId: 'EVT-FIE', eventName: 'Fiesp – Saúde & Bem-Estar', company: 'Fiesp', date: '08/04/2026', servico: 'Fisioterapia', avaliacao: 4.5 },
      { eventId: 'EVT-CNI', eventName: 'CNI – Saúde no Trabalho',    company: 'CNI',   date: '10/03/2026', servico: 'Fisioterapia', avaliacao: 4.4 },
    ],
  },
  'PRO-010': {
    telefone: '(51) 98876-5432', sexo: 'Masculino', tipoCadastro: 'PJ',
    endereco: { cep: '90010-280', logradouro: 'Av. Borges de Medeiros', numero: '150', complemento: '', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS' },
    eventHistory: [
      { eventId: 'EVT-GRD', eventName: 'Gerdau – Saúde Corporativa', company: 'Gerdau',     date: '07/04/2026', servico: 'Quick Massage', avaliacao: 4.7 },
      { eventId: 'EVT-AES', eventName: 'AES Brasil – Bem-Estar',     company: 'AES Brasil', date: '14/03/2026', servico: 'Quick Massage', avaliacao: 4.6 },
      { eventId: 'EVT-BRF', eventName: 'BRF – Dia da Saúde',         company: 'BRF',        date: '02/01/2026', servico: 'Quick Massage', avaliacao: 4.5 },
    ],
  },
  'PRO-011': {
    telefone: '(11) 97765-4321', sexo: 'Feminino', tipoCadastro: 'PF',
    endereco: { cep: '05423-020', logradouro: 'Rua Hadock Lobo', numero: '595', complemento: 'Apto 54', bairro: 'Cerqueira César', cidade: 'São Paulo', estado: 'SP' },
    eventHistory: [
      { eventId: 'EVT-RAI', eventName: 'Raízen – Saúde & Bem-Estar', company: 'Raízen', date: '06/04/2026', servico: 'Podologia', avaliacao: 4.3 },
      { eventId: 'EVT-CSN', eventName: 'CSN – Saúde no Trabalho',    company: 'CSN',    date: '15/02/2026', servico: 'Podologia', avaliacao: 4.1 },
    ],
  },
  'PRO-012': {
    telefone: '(81) 96654-3210', sexo: 'Masculino', tipoCadastro: 'PF',
    endereco: { cep: '50010-010', logradouro: 'Av. Dantas Barreto', numero: '250', complemento: '', bairro: 'Santo Antônio', cidade: 'Recife', estado: 'PE' },
    eventHistory: [
      { eventId: 'EVT-VAL', eventName: 'Vale – Dia Saúde', company: 'Vale', date: '05/04/2026', servico: 'Terapia', avaliacao: 4.0 },
    ],
  },
};

const DEFAULT_DETAIL: ProfissionalDetailData = {
  telefone: '—', sexo: 'Masculino', tipoCadastro: 'PF',
  endereco: { cep: '—', logradouro: '—', numero: '—', complemento: '', bairro: '—', cidade: '—', estado: '—' },
  eventHistory: [],
};

// ─── Labels ───────────────────────────────────────────────────────────────────
const FUNCAO_LABEL: Record<string, string> = {
  massoterapeuta: 'Massoterapeuta',
  acupunturista:  'Acupunturista',
  'podólogo':     'Podólogo',
  fisioterapeuta: 'Fisioterapeuta',
  terapeuta:      'Terapeuta',
  quiropraxista:  'Quiropraxista',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function aggregateEvalData(history: EventoRealizado[]): EvalData | null {
  const withEval = history.filter(e => e.evalData);
  if (withEval.length === 0) return null;

  const axisMap = new Map<string, number[]>();
  const svcMap  = new Map<string, number[]>();

  for (const ev of withEval) {
    for (const d of ev.evalData!.radarDimensions) {
      if (!axisMap.has(d.axis)) axisMap.set(d.axis, []);
      axisMap.get(d.axis)!.push(d.value);
    }
    for (const s of ev.evalData!.servicoRatings) {
      if (!svcMap.has(s.name)) svcMap.set(s.name, []);
      svcMap.get(s.name)!.push(s.rating);
    }
  }

  const radarDimensions = [...axisMap.entries()].map(([axis, vals]) => ({
    axis,
    value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
  }));
  const servicoRatings = [...svcMap.entries()].map(([name, vals]) => ({
    name,
    rating: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
  }));

  return { radarDimensions, servicoRatings };
}

function sortedChronologically(history: EventoRealizado[]): EventoRealizado[] {
  return [...history].sort((a, b) => {
    const parseDate = (d: string) => {
      const [day, month, year] = d.split('/').map(Number);
      return new Date(year, month - 1, day).getTime();
    };
    return parseDate(a.date) - parseDate(b.date);
  });
}

// ─── NotaLineChart ────────────────────────────────────────────────────────────
// Escala 1–5 (avaliações por estrelas)
interface NotaPoint { period: string; nota: number; }

function NotaLineChart({ data, className }: { data: NotaPoint[]; className?: string }) {
  const [hovered, setHovered] = useState<(NotaPoint & { px: number; py: number }) | null>(null);
  const W = 560, H = 240;
  const padL = 48, padT = 20, padR = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const yMin = 2.5, yMax = 5.5;
  const n = data.length;

  if (n === 0) return <div className={[styles.chartCardWide, className].filter(Boolean).join(' ')}><div className={styles.noData}>Sem histórico de avaliações para exibir.</div></div>;

  const xOf = (i: number) => padL + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const yOf = (v: number) => padT + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(d.nota).toFixed(1)}`).join(' ');
  const gridVals = [3, 3.5, 4, 4.5, 5];

  return (
    <div className={[styles.chartCardWide, className].filter(Boolean).join(' ')}>
      <span className={styles.chartTitle}>Evolução da nota</span>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          {gridVals.map(v => (
            <g key={v}>
              <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="#F0EDEC" strokeWidth="1" />
              <text x={padL - 8} y={yOf(v) + 4} textAnchor="end" fontSize="10" fill="#9E8E8F">{v}</text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={d.period} x={xOf(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#9E8E8F">{d.period}</text>
          ))}
          {n > 1 && (
            <path
              d={`${path} L ${xOf(n - 1)} ${padT + chartH} L ${xOf(0)} ${padT + chartH} Z`}
              fill="#B25557" fillOpacity="0.07"
            />
          )}
          <path d={path} fill="none" stroke="#B25557" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {hovered && (
            <line x1={hovered.px} y1={padT} x2={hovered.px} y2={padT + chartH}
              stroke="#B25557" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
          )}
          {data.map((d, i) => (
            <circle key={i} cx={xOf(i)} cy={yOf(d.nota)} r={hovered?.period === d.period ? 6 : 4}
              fill="#B25557" stroke="#fff" strokeWidth="2" style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered({ ...d, px: xOf(i), py: yOf(d.nota) })}
              onMouseLeave={() => setHovered(null)} />
          ))}
        </svg>
        {hovered && (
          <div className={tooltipStyles.tip} style={{
            position: 'absolute',
            left: `${(hovered.px / W) * 100}%`,
            top: `${(hovered.py / H) * 100}%`,
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none', whiteSpace: 'nowrap', opacity: 1,
          }}>
            {hovered.period} · Nota {hovered.nota.toFixed(1)} / 5
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ProfRadarChart ───────────────────────────────────────────────────────────
// Escala 0–10. Série vermelha = Último evento; série amarela = Média em eventos
function ProfRadarChart({ data, className }: { data: Array<{ axis: string; value: number }>; className?: string }) {
  // "Último evento" = dados reais; "Média em eventos" ≈ 90% dos valores
  const ultimo = data;
  const media  = data.map(d => ({ ...d, value: +(d.value * 0.9).toFixed(1) }));

  const [hovered, setHovered] = useState<{
    label: string; ultimo: number; media: number; x: number; y: number;
  } | null>(null);

  const VW = 540, VH = 220;
  const cx = 270, cy = 112, maxR = 63, maxVal = 10;
  const n = data.length;
  const angleOf = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const ptOf = (v: number, i: number) => ({
    x: cx + (v / maxVal) * maxR * Math.cos(angleOf(i)),
    y: cy + (v / maxVal) * maxR * Math.sin(angleOf(i)),
  });
  const levels = [2, 4, 6, 8, 10];
  const polyStr = (arr: typeof data) =>
    arr.map((d, i) => { const p = ptOf(d.value, i); return `${p.x},${p.y}`; }).join(' ');

  return (
    <div className={[styles.chartCard, className].filter(Boolean).join(' ')} style={{ minHeight: 'unset' }}>
      {/* Header: título + legenda */}
      <div className={styles.chartHeaderRow}>
        <span className={styles.chartTitle}>Radar de Desempenho</span>
        <div className={styles.lineLegend}>
          <div className={styles.lineLegendItem}>
            <span className={styles.lineDot} style={{ background: '#B25557' }} />
            Último evento
          </div>
          <div className={styles.lineLegendItem}>
            <span className={styles.lineDot} style={{ background: '#EAB308' }} />
            Média
          </div>
        </div>
      </div>

      {/* Descrição */}
      <span className={styles.radarDesc}>
        Radar de desempenho com base nos pilares do IBE, considerando a média das avaliações
        realizadas por beneficiários que utilizaram os serviços do profissional em eventos.
      </span>

      {/* SVG */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
          {/* Grid rings */}
          {levels.map(lv => {
            const pts = data.map((_, i) => { const p = ptOf(lv, i); return `${p.x},${p.y}`; }).join(' ');
            return <polygon key={lv} points={pts} fill="none" stroke="#F0EDEC" strokeWidth="1" />;
          })}
          {/* Level labels */}
          {[4, 8].map(lv => {
            const p = ptOf(lv, 2);
            return <text key={lv} x={p.x + 3} y={p.y + 3} fontSize="8" fill="#C8C0C0">{lv}</text>;
          })}
          {/* Axes */}
          {data.map((_, i) => {
            const end = ptOf(maxVal, i);
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E8DFE0" strokeWidth="1" />;
          })}
          {/* Média em eventos (amarelo, tracejado, abaixo) */}
          <polygon points={polyStr(media)} fill="#EAB308" fillOpacity="0.12"
            stroke="#EAB308" strokeWidth="1.5" strokeDasharray="4 3" />
          {/* Último evento (vermelho, sólido, acima) */}
          <polygon points={polyStr(ultimo)} fill="#B25557" fillOpacity="0.18"
            stroke="#B25557" strokeWidth="2" />
          {/* Pontos interativos — último evento */}
          {ultimo.map((d, i) => {
            const p = ptOf(d.value, i);
            return (
              <circle key={i} cx={p.x} cy={p.y} r={hovered?.label === d.axis ? 7 : 5}
                fill="#B25557" stroke="#fff" strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 120ms' }}
                onMouseMove={e => setHovered({ label: d.axis, ultimo: d.value, media: media[i].value, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHovered(null)} />
            );
          })}
          {/* Axis labels */}
          {data.map((d, i) => {
            const angle = angleOf(i);
            const lx = cx + (maxR + 28) * Math.cos(angle);
            const ly = cy + (maxR + 28) * Math.sin(angle);
            const anchor = Math.cos(angle) > 0.15 ? 'start' : Math.cos(angle) < -0.15 ? 'end' : 'middle';
            return (
              <text key={i} x={lx} y={ly + 4} textAnchor={anchor} fontSize="11" fill="#9E8E8F" fontWeight="500">
                {d.axis}
              </text>
            );
          })}
        </svg>
        {hovered && (
          <div className={tooltipStyles.tip} style={{
            position: 'fixed', left: hovered.x, top: hovered.y - 44,
            transform: 'translateX(-50%)', pointerEvents: 'none',
            whiteSpace: 'nowrap', zIndex: 9999, opacity: 1,
          }}>
            {hovered.label} · Último {hovered.ultimo} · Média {hovered.media}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ProfServiceBars ──────────────────────────────────────────────────────────
// rating interno 0–10 → exibido como 0–5 (÷2) para consistência com escala de notas
function ProfServiceBars({ data, className }: { data: Array<{ name: string; rating: number }>; className?: string }) {
  const ratings = [...data].sort((a, b) => b.rating - a.rating);
  const [hovered, setHovered] = useState<{ label: string; rating: number; x: number; y: number } | null>(null);

  return (
    <div className={[styles.chartCard, className].filter(Boolean).join(' ')} style={{ minHeight: 'unset' }}>
      <span className={styles.chartTitle}>Notas por serviço</span>
      <div className={styles.barChartBody}>
        {ratings.map(s => {
          const display = (s.rating / 2).toFixed(1); // converte 0–10 → 0–5
          return (
            <div key={s.name} className={styles.barRow} style={{ cursor: 'pointer' }}
              onMouseMove={e => setHovered({ label: s.name, rating: s.rating, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHovered(null)}
            >
              <span className={styles.barLabel}>{s.name}</span>
              <div className={styles.barTrackGroup}>
                <div className={styles.barTrack}>
                  {/* fill baseado em 0–10 internamente → mesmo resultado visual */}
                  <div className={styles.barFill} style={{ width: `${(s.rating / 10) * 100}%` }} />
                </div>
                <span className={styles.barPct}>{display}</span>
              </div>
            </div>
          );
        })}
      </div>
      {hovered && (
        <div className={tooltipStyles.tip} style={{
          position: 'fixed', left: hovered.x, top: hovered.y - 44,
          transform: 'translateX(-50%)', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 9999,
        }}>
          {hovered.label} · Nota {(hovered.rating / 2).toFixed(1)} / 5
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProfissionalDetailScreenProps {
  prof:           Profissional;
  role:           UserRole;
  sidebarOffset?: number;
  onNavChange?:   (item: string) => void;
  onBack:         () => void;
}

// ─── ProfissionalDetailScreen ─────────────────────────────────────────────────
export function ProfissionalDetailScreen({
  prof, role, sidebarOffset = 0, onNavChange, onBack,
}: ProfissionalDetailScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav,   setActiveNav]   = useState('profissionais');
  const [activeTab,   setActiveTab]   = useState<DetailTab>('dados');
  const [filterEvent, setFilterEvent] = useState('');
  const [histSearch,  setHistSearch]  = useState('');

  const detail    = MOCK_DETAIL[prof.id] ?? DEFAULT_DETAIL;
  const funcLabel = FUNCAO_LABEL[prof.funcao] ?? String(prof.funcao);

  // ── Avaliações data ──────────────────────────────────────────────────────
  const eventsWithEval = detail.eventHistory.filter(e => e.evalData);
  const selectedEv     = filterEvent ? detail.eventHistory.find(e => e.eventId === filterEvent) : null;
  const currentEval: EvalData | null = selectedEv?.evalData
    ?? (filterEvent ? null : aggregateEvalData(detail.eventHistory));

  // Line chart — escala 1–5, ordenado cronologicamente
  const lineData: NotaPoint[] = sortedChronologically(detail.eventHistory).map(ev => ({
    period: ev.date.slice(0, 5), // 'DD/MM'
    nota:   ev.avaliacao,
  }));

  // Stars helper
  function renderStars(nota: number, size = 13) {
    return (
      <>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = nota >= i + 1;
          return (
            <Star key={i} size={size}
              fill={filled ? '#F59E0B' : 'none'}
              color={filled ? '#F59E0B' : '#D1D5DB'}
            />
          );
        })}
      </>
    );
  }

  return (
    <div
      className={styles.shell}
      style={{ '--proto-offset': `${sidebarOffset}px` } as React.CSSProperties}
    >
      <div className={styles.sidebarFixed}>
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
          activeItem={activeNav}
          onNavClick={item => { setActiveNav(item); onNavChange?.(item); }}
          user={{ name: 'Admin Prana', email: 'admin@prana.com', initials: 'AP' }}
          role={role}
        />
      </div>

      <div className={[styles.contentWrap, !sidebarOpen ? styles.contentWrapClosed : ''].filter(Boolean).join(' ')}>
        <div className={styles.contentCard}>

          {/* ── ← Voltar ────────────────────────────────────────────────── */}
          <button className={styles.backNav} onClick={onBack}>
            <ArrowLeft size={14} />
            Voltar
          </button>

          {/* ── Header: nome + subtítulo · nota à direita ────────────────── */}
          <div className={styles.pageHeader}>
            <div className={styles.headerMeta}>
              <h1 className={styles.pageTitle}>{prof.name}</h1>
              <div className={styles.pageSub}>
                <span>{funcLabel}</span>
                <span className={styles.pageSubSep}>·</span>
                <span>{prof.localizacao}</span>
              </div>
            </div>

            {/* Nota no lado direito — sem card, inline */}
            <div className={styles.headerNota}>
              <div className={styles.headerNotaRow}>
                <Star size={20} fill="#F59E0B" color="#F59E0B" />
                <span className={styles.headerNotaValue}>{prof.nota.toFixed(1)}</span>
              </div>
              <span className={styles.headerNotaLabel}>nota média</span>
            </div>
          </div>

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <div className={styles.tabs}>
            <button
              className={[styles.tab, activeTab === 'dados' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab('dados')}
            >
              Dados
            </button>
            <button
              className={[styles.tab, activeTab === 'avaliacoes' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab('avaliacoes')}
            >
              Avaliações
            </button>
          </div>

          {/* ── Tab: Dados ──────────────────────────────────────────────── */}
          {activeTab === 'dados' && (
            <div className={styles.tabContent}>

              {/* Informações — sem duplicar nome/especialidade/localidade (já no header) */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Informações do Profissional</span>
                </div>

                {/* ── Dados básicos ─────────────────────────────────────── */}
                <div className={styles.infoGrid}>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Tipo de cadastro</span>
                    <span className={styles.infoValue}>{detail.tipoCadastro}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Telefone</span>
                    <span className={styles.infoValue}>{detail.telefone}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Sexo</span>
                    <span className={styles.infoValue}>{detail.sexo}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Eventos realizados</span>
                    <span className={styles.infoValue}>{prof.eventosRealizados}</span>
                  </div>
                  {/* Nota média — posicionada próxima de Eventos, com destaque visual */}
                  <div className={[styles.infoField, styles.infoFieldFull, styles.infoFieldHighlight].join(' ')}>
                    <span className={styles.infoLabel}>Nota média</span>
                    <div className={styles.notaCell}>
                      <Star size={16} fill="#F59E0B" color="#F59E0B" />
                      <span className={[styles.infoValue, styles.infoValueLg].join(' ')}>{prof.nota.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* ── Endereço ──────────────────────────────────────────── */}
                <div className={styles.infoGroupHeader}>
                  <span className={styles.infoGroupTitle}>Endereço</span>
                </div>

                <div className={[styles.infoGrid, styles.infoGridAddress].join(' ')}>
                  {/* CEP — linha única */}
                  <div className={[styles.infoField, styles.infoFieldFull].join(' ')}>
                    <span className={styles.infoLabel}>CEP</span>
                    <span className={styles.infoValue}>{detail.endereco.cep}</span>
                  </div>
                  {/* Logradouro + Número */}
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Logradouro</span>
                    <span className={styles.infoValue}>{detail.endereco.logradouro}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Número</span>
                    <span className={styles.infoValue}>{detail.endereco.numero}</span>
                  </div>
                  {/* Complemento + Bairro */}
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Complemento</span>
                    <span className={styles.infoValue}>{detail.endereco.complemento || '—'}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Bairro</span>
                    <span className={styles.infoValue}>{detail.endereco.bairro}</span>
                  </div>
                  {/* Cidade + Estado (UF) */}
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Cidade</span>
                    <span className={styles.infoValue}>{detail.endereco.cidade}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Estado (UF)</span>
                    <span className={styles.infoValue}>{detail.endereco.estado}</span>
                  </div>
                </div>
              </div>

              {/* Histórico de Eventos */}
              <div className={styles.tableSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Histórico de Eventos</span>
                  <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      className={styles.searchInput}
                      type="text"
                      placeholder="Buscar por empresa ou evento"
                      value={histSearch}
                      onChange={e => setHistSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr className={styles.headerRow}>
                        <th className={styles.th}>Evento</th>
                        <th className={styles.th}>Empresa</th>
                        <th className={styles.th}>Data</th>
                        <th className={styles.th}>Serviço</th>
                        <th className={styles.th}>Avaliação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.eventHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className={styles.emptyTable}>
                            Nenhum evento registrado para este profissional.
                          </td>
                        </tr>
                      ) : (() => {
                        const q = histSearch.toLowerCase().trim();
                        const filtered = [...detail.eventHistory]
                          .sort((a, b) => {
                            const p = (d: string) => { const [dd, mm, yy] = d.split('/').map(Number); return new Date(yy, mm - 1, dd).getTime(); };
                            return p(b.date) - p(a.date);
                          })
                          .filter(ev =>
                            !q ||
                            ev.eventName.toLowerCase().includes(q) ||
                            ev.company.toLowerCase().includes(q)
                          );
                        return filtered.length === 0 ? (
                          <tr>
                            <td colSpan={5} className={styles.emptyTable}>
                              Nenhum evento encontrado para "{histSearch}".
                            </td>
                          </tr>
                        ) : filtered.map(ev => (
                          <tr key={ev.eventId} className={styles.tr}>
                            <td className={styles.td}><span className={styles.tdBold}>{ev.eventName}</span></td>
                            <td className={styles.td}><span className={styles.tdText}>{ev.company}</span></td>
                            <td className={styles.td}><span className={styles.tdText}>{ev.date}</span></td>
                            <td className={styles.td}><span className={styles.tdText}>{ev.servico}</span></td>
                            <td className={styles.td}>
                              <div className={styles.notaCell}>
                                {renderStars(ev.avaliacao)}
                                <span className={styles.notaValue}>{ev.avaliacao.toFixed(1)}</span>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ── Tab: Avaliações ─────────────────────────────────────────── */}
          {activeTab === 'avaliacoes' && (
            <div className={styles.tabContent}>

              {/* Filtro por evento */}
              <div className={styles.avalControls}>
                <div className={styles.filterWrap}>
                  <select
                    className={styles.filterSelect}
                    value={filterEvent}
                    onChange={e => setFilterEvent(e.target.value)}
                  >
                    <option value="">Todos os eventos</option>
                    {eventsWithEval.map(ev => (
                      <option key={ev.eventId} value={ev.eventId}>{ev.eventName}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className={styles.filterChevron} />
                </div>
              </div>

              {/* Média geral */}
              <div className={styles.avgCard}>
                <div className={styles.avgLeft}>
                  <div className={styles.avgValue}>{prof.nota.toFixed(1)}</div>
                  <div className={styles.avgStars}>{renderStars(prof.nota, 18)}</div>
                  <span className={styles.avgLabel}>Nota média geral</span>
                </div>
                <div className={styles.avgDivider} />
                <div className={styles.avgMeta}>
                  <div className={styles.avgBenchmark}>
                    <TrendingUp size={12} />
                    Acima da média Prana
                  </div>
                  <span className={styles.avgEventCount}>
                    {detail.eventHistory.length} evento{detail.eventHistory.length !== 1 ? 's' : ''} realizado{detail.eventHistory.length !== 1 ? 's' : ''}
                  </span>
                  <span className={styles.avgEventCount}>
                    {eventsWithEval.length} evento{eventsWithEval.length !== 1 ? 's' : ''} com avaliação detalhada
                  </span>
                </div>
              </div>

              {/* ── Grid: Evolução (70%) + Radar (30%) / Barras (col 1, linha 2) ── */}
              {currentEval ? (
                <div className={styles.chartsGrid}>
                  <NotaLineChart data={lineData} className={styles.chartEvolucao} />
                  <ProfRadarChart data={currentEval.radarDimensions} className={styles.chartRadar} />
                  <ProfServiceBars data={currentEval.servicoRatings} className={styles.chartServiceBars} />
                </div>
              ) : (
                <>
                  {/* Sem eval detalhada: só mostra linha de evolução em largura total */}
                  <NotaLineChart data={lineData} />
                  <div className={styles.section}>
                    <div className={styles.noData}>
                      {filterEvent
                        ? 'Dados de avaliação detalhada não disponíveis para este evento.'
                        : 'Nenhuma avaliação detalhada disponível para este profissional.'}
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
