import styles from './AppHeader.module.css';

export interface AppHeaderProps {
  /** URL da logo. Padrão: logo Prana SVG. */
  logoSrc?: string;
  /** Texto alternativo da logo para acessibilidade. */
  logoAlt?: string;
}

export function AppHeader({
  logoSrc = '/logos/PRANA_ENXOVAL__LOGO_Eventos_2_Magenta.svg',
  logoAlt = 'Espaço Prana',
}: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <img src={logoSrc} alt={logoAlt} className={styles.logo} />
      </div>
    </header>
  );
}
