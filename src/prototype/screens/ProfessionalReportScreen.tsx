import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { RadioButton } from '../../components/RadioButton/RadioButton';
import { Button } from '../../components/Button/Button';
import { AppHeader } from '../components/AppHeader';
import styles from './ProfessionalReportScreen.module.css';

// ─── Tipos ──────────────────────────────────────────────

interface ReportOption { label: string; value: string; }

interface UploadedImage {
  id: string;           // UUID único
  dataUrl: string;      // data URL
  fileName: string;     // nome original
  fileSize: number;     // bytes
  uploadedAt: Date;     // timestamp
}

// ─── Demo data ───────────────────────────────────────────

const EXPERIENCE_OPTIONS: ReportOption[] = [
  { label: 'Excelente',  value: '5' },
  { label: 'Muito bom',  value: '4' },
  { label: 'Bom',        value: '3' },
  { label: 'Regular',    value: '2' },
  { label: 'Ruim',       value: '1' },
];

const INTERCURRENCE_OPTIONS: ReportOption[] = [
  { label: 'Sim',  value: 'yes' },
  { label: 'Não', value: 'no' },
];

const EVENT = {
  name: 'Programa de Bem-Estar',
  location: 'Escritório Google',
};

// ─── Componente ──────────────────────────────────────────

interface ProfessionalReportScreenProps {
  viewport?:   'mobile' | 'desktop';
  onNavigate?: () => void;
}

export function ProfessionalReportScreen({
  viewport   = 'desktop',
  onNavigate,
}: ProfessionalReportScreenProps) {
  const isDesktop = viewport === 'desktop';

  // ── Estados ─────────────────────────────────────────
  const [experience, setExperience]         = useState<string>('');
  const [intercurrence, setIntercurrence]   = useState<string>('');
  const [intercurrenceDetail, setIntercurrenceDetail] = useState<string>('');
  const [generalMessage, setGeneralMessage] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([
    {
      id: '1713192000000-1',
      dataUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%228B5CF6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImagem 1%3C/text%3E%3C/svg%3E',
      fileName: 'evento-001.jpg',
      fileSize: 2457600,
      uploadedAt: new Date(),
    },
    {
      id: '1713192000000-2',
      dataUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%2310B981%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImagem 2%3C/text%3E%3C/svg%3E',
      fileName: 'evento-002.jpg',
      fileSize: 1843200,
      uploadedAt: new Date(),
    },
    {
      id: '1713192000000-3',
      dataUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22F59E0B%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImagem 3%3C/text%3E%3C/svg%3E',
      fileName: 'evento-003.jpg',
      fileSize: 3072000,
      uploadedAt: new Date(),
    },
  ]);

  // ── Validação ────────────────────────────────────────
  const canSubmit = experience && intercurrence && generalMessage;

  function handleSubmit() {
    if (!canSubmit) return;
    onNavigate?.();
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      const id = `${Date.now()}-${Math.random()}`;

      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages(prev => [...prev, {
            id,
            dataUrl: event.target!.result as string,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date(),
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(id: string) {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Hero */}
      <div className={styles.hero}>
        <div className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}>
          <span className={styles.heroTag}>Relatório de evento</span>
          <h1 className={styles.heroTitle}>{EVENT.name}</h1>
          <p className={styles.heroSub}>Compartilhe sua experiência, leva menos de 5 minutos.</p>
        </div>
      </div>

      {/* Formulário */}
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>

        {/* ── 1. Avaliação da experiência ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sua experiência</h2>
          <div className={styles.questionCard}>
            <RadioButton
              name="experience"
              label="Como você avalia sua experiência no evento?"
              options={EXPERIENCE_OPTIONS}
              value={experience}
              onChange={setExperience}
            />
          </div>
        </section>

        {/* ── 2. Intercorrência ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ocorrências</h2>
          <div className={styles.questionCard}>
            <RadioButton
              name="intercurrence"
              label="Houve alguma intercorrência durante o evento?"
              options={INTERCURRENCE_OPTIONS}
              value={intercurrence}
              onChange={setIntercurrence}
            />
          </div>

          {/* Textarea condicional */}
          {intercurrence === 'yes' && (
            <div className={styles.textareaGroup}>
              <label htmlFor="intercurrenceDetail" className={styles.label}>
                Descreva o que aconteceu
              </label>
              <textarea
                id="intercurrenceDetail"
                className={styles.textarea}
                placeholder="Detalhe a intercorrência..."
                rows={3}
                value={intercurrenceDetail}
                onChange={(e) => setIntercurrenceDetail(e.target.value)}
              />
            </div>
          )}
        </section>

        {/* ── 3. Mensagem geral ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Relato geral</h2>
          <div className={styles.textareaGroup}>
            <label htmlFor="generalMessage" className={styles.label}>
              Compartilhe mais detalhes sobre sua experiência
            </label>
            <textarea
              id="generalMessage"
              className={styles.textarea}
              placeholder="Conte-nos mais sobre o evento, como foi sua experiência, pontos positivos, áreas de melhoria, etc."
              rows={5}
              value={generalMessage}
              onChange={(e) => setGeneralMessage(e.target.value)}
            />
          </div>
        </section>

        {/* ── 4. Upload de imagens ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Registros visuais</h2>

          {/* Input file (hidden) */}
          <input
            type="file"
            id="imageInput"
            multiple
            accept="image/*"
            className={styles.fileInput}
            onChange={handleImageUpload}
          />

          {/* Upload area */}
          <label htmlFor="imageInput" className={styles.uploadArea}>
            <Upload size={32} className={styles.uploadIcon} />
            <span className={styles.uploadText}>Arraste imagens ou clique para enviar</span>
            <span className={styles.uploadSub}>PNG, JPG, até 10 MB cada</span>
          </label>

          {/* Lista de imagens */}
          {uploadedImages.length > 0 && (
            <div className={styles.imageListContainer}>
              <div className={styles.imageList}>
              {uploadedImages.map((img) => (
                <div key={img.id} className={styles.imageListItem}>
                  <img
                    src={img.dataUrl}
                    alt={img.fileName}
                    className={styles.imageThumbnailSmall}
                  />
                  <div className={styles.imageInfo}>
                    <p className={styles.imageName}>{img.fileName}</p>
                    <p className={styles.imageSize}>
                      {(img.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeImage(img.id)}
                    aria-label={`Remover ${img.fileName}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              </div>
            </div>
          )}
        </section>

      </div>

      {/* CTA fixo */}
      <div className={styles.ctaBar}>
        <div className={[styles.ctaInner, isDesktop ? styles.ctaInnerDesktop : ''].filter(Boolean).join(' ')}>
          <Button
            variant="primary"
            size="lg"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Enviar relatório
          </Button>
        </div>
      </div>
    </div>
  );
}
