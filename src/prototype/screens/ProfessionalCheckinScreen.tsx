import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { AppHeader } from '../components/AppHeader';
import styles from './ProfessionalReportScreen.module.css';

// ─── Tipos ──────────────────────────────────────────────

interface UploadedImage {
  id: string;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

// ─── Demo data ───────────────────────────────────────────

const EVENT = {
  name: 'Programa de Bem-Estar',
  location: 'Escritório Google',
};

// ─── Componente ──────────────────────────────────────────

interface ProfessionalCheckinScreenProps {
  viewport?:   'mobile' | 'desktop';
  onNavigate?: () => void;
}

export function ProfessionalCheckinScreen({
  viewport   = 'desktop',
  onNavigate,
}: ProfessionalCheckinScreenProps) {
  const isDesktop = viewport === 'desktop';

  // ── Estados ─────────────────────────────────────────
  const [observations, setObservations] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([
    {
      id: '1713192000000-1',
      dataUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%228B5CF6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EFoto 1%3C/text%3E%3C/svg%3E',
      fileName: 'checkin-001.jpg',
      fileSize: 2457600,
      uploadedAt: new Date(),
    },
    {
      id: '1713192000000-2',
      dataUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%2310B981%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EFoto 2%3C/text%3E%3C/svg%3E',
      fileName: 'checkin-002.jpg',
      fileSize: 1843200,
      uploadedAt: new Date(),
    },
  ]);

  // ── Validação e progresso ────────────────────────────
  const canSubmit = !!observations.trim();

  const TOTAL_FIELDS   = 1; // observations obrigatório
  const answeredFields = observations.trim() ? 1 : 0;
  const progressPct    = Math.round((answeredFields / TOTAL_FIELDS) * 100);

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
      <div className={styles.stickyHeader}>
        <AppHeader />
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}>
          <span className={styles.heroTag}>Check-in Evento</span>
          <h1 className={styles.heroTitle}>{EVENT.name}</h1>
          <p className={styles.heroSub}>Registre sua chegada e compartilhe observações iniciais.</p>
        </div>
      </div>

      {/* Formulário */}
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>

        {/* ── 1. Registros fotográficos ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Registros do check-in</h2>

          <input
            type="file"
            id="checkinImageInput"
            multiple
            accept="image/*"
            className={styles.fileInput}
            onChange={handleImageUpload}
          />

          <label htmlFor="checkinImageInput" className={styles.uploadArea}>
            <Upload size={32} className={styles.uploadIcon} />
            <span className={styles.uploadText}>Arraste fotos ou clique para enviar</span>
            <span className={styles.uploadSub}>PNG, JPG, até 10 MB cada</span>
          </label>

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

        {/* ── 2. Observações ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Observações</h2>
          <div className={styles.textareaGroup}>
            <label htmlFor="observations" className={styles.label}>
              Compartilhe suas observações iniciais sobre o evento
            </label>
            <textarea
              id="observations"
              className={styles.textarea}
              placeholder="Descreva as condições do local, equipamentos disponíveis, número de participantes esperados, etc."
              rows={5}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>
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
            Confirmar check-in
          </Button>
        </div>
      </div>
    </div>
  );
}
