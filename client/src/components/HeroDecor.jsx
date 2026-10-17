// Decoracion mexicana del hero: iconos planos, guirnalda de papel picado y separador de sarape.
// Cada icono usa currentColor como color principal y --a1 / --a2 para los detalles.

function Icon({ children, title, className = '', style }) {
  const decorative = !title;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={`mx-icon ${className}`}
      style={style}
      aria-hidden={decorative ? 'true' : undefined}
      role={decorative ? undefined : 'img'}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

const A1 = 'var(--a1)';
const A2 = 'var(--a2)';

export function IconLuchador(props) {
  return (
    <Icon {...props}>
      <path fillRule="evenodd" d="M32 5C17 5 10 17 10 32c0 15 9 27 22 27s22-12 22-27C54 17 47 5 32 5ZM17 27q7-7 12 3-6 5-12-3Zm30 0q-7-7-12 3 6 5 12-3ZM25 45q7 7 14 0-7-4-14 0Z" />
      <path fill={A1} d="M30 6h4v15l-2 5-2-5Z" />
      <path fill={A1} d="M14 25q8-9 16 4l-2 3q-6-9-12-5Zm36 0q-8-9-16 4l2 3q6-9 12-5Z" />
    </Icon>
  );
}

export function IconSombrero(props) {
  return (
    <Icon {...props}>
      <ellipse cx="32" cy="44" rx="29" ry="9" />
      <path d="M21 42q-2-26 11-29 13 3 11 29Z" />
      <rect x="20.5" y="32" width="23" height="7" fill={A1} />
      <path fill="none" stroke={A2} strokeWidth="2" strokeLinejoin="miter" d="M21 38.5l2.9-5 2.9 5 2.9-5 2.9 5 2.9-5 2.9 5 2.9-5 2.7 5" />
    </Icon>
  );
}

export function IconGuitarra(props) {
  return (
    <Icon {...props}>
      <rect x="27" y="2" width="10" height="8" rx="1.5" />
      <rect x="30" y="8" width="4" height="20" />
      <circle cx="32" cy="31" r="10" />
      <circle cx="32" cy="46" r="14" />
      <circle cx="32" cy="43" r="4.5" fill={A1} />
      <circle cx="32" cy="43" r="8" fill="none" stroke={A1} strokeWidth="3" strokeDasharray="2 2.2" />
      <rect x="25" y="53" width="14" height="2.5" rx="1" fill={A2} />
    </Icon>
  );
}

export function IconMaracas(props) {
  return (
    <Icon {...props} className={`mx-maracas ${props.className || ''}`}>
      <g className="mx-maraca mx-maraca-l">
        <g transform="rotate(-28 32 44)">
          <rect x="30" y="30" width="4" height="26" rx="2" />
          <ellipse cx="32" cy="20" rx="10" ry="13" />
          <path fill={A1} d="M22.6 17h18.8v6H22.6Z" />
          <path fill="none" stroke={A2} strokeWidth="1.8" d="M23 20l3-3 3 3 3-3 3 3 3-3 3 3" />
        </g>
      </g>
      <g className="mx-maraca mx-maraca-r">
        <g transform="rotate(28 32 44)">
          <rect x="30" y="30" width="4" height="26" rx="2" fill={A2} />
          <ellipse cx="32" cy="20" rx="10" ry="13" fill={A2} />
          <path fill={A1} d="M22.6 17h18.8v6H22.6Z" />
          <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M23 20l3-3 3 3 3-3 3 3 3-3 3 3" />
        </g>
      </g>
    </Icon>
  );
}

export function IconBurro(props) {
  return (
    <Icon {...props}>
      <path d="M41 13l1.5-10 4 10Zm5 0l3.5-10 2.5 10Z" />
      <rect x="38" y="12" width="17" height="10" rx="3" />
      <rect x="38" y="16" width="9" height="18" />
      <rect x="12" y="28" width="34" height="16" rx="2" />
      <rect x="15" y="43" width="6" height="15" />
      <rect x="37" y="43" width="6" height="15" />
      <path d="M12 31l-7 7 3 2 5-5Z" />
      <rect x="12" y="32" width="34" height="3.5" fill={A1} />
      <rect x="12" y="39" width="34" height="3.5" fill={A2} />
      <rect x="38" y="24" width="9" height="3" fill={A1} />
      <circle cx="49" cy="16.5" r="1.6" fill={A1} />
    </Icon>
  );
}

export function IconCalavera(props) {
  return (
    <Icon {...props}>
      <path fillRule="evenodd" d="M32 5C18 5 9 15 9 28c0 8 4 13 10 15v9q0 4 4 4h18q4 0 4-4v-9c6-2 10-7 10-15C55 15 46 5 32 5Zm-10 16a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm20 0a7 7 0 1 1 0 14 7 7 0 0 1 0-14ZM32 36l-3.5 6h7ZM25 47h2.5v7H25Zm5.75 0h2.5v7h-2.5Zm5.75 0H39v7h-2.5Z" />
      <circle cx="22" cy="28" r="3" fill={A1} />
      <circle cx="42" cy="28" r="3" fill={A1} />
      <path fill={A2} d="M32 9l2.5 4L32 17l-2.5-4Z" />
      <circle cx="24" cy="13" r="1.6" fill={A2} />
      <circle cx="40" cy="13" r="1.6" fill={A2} />
    </Icon>
  );
}

export function IconPiramide(props) {
  return (
    <Icon {...props}>
      <rect x="4" y="50" width="56" height="9" />
      <rect x="10" y="41" width="44" height="10" />
      <rect x="16" y="32" width="32" height="10" />
      <rect x="22" y="23" width="20" height="10" />
      <path fillRule="evenodd" d="M25 10h14v14H25Zm5 6v8h4v-8Z" />
      <rect x="28.5" y="24" width="7" height="35" fill={A1} />
      <path fill={A2} d="M23 7h18l-2 3H25Z" />
    </Icon>
  );
}

export function IconCactus(props) {
  return (
    <Icon {...props}>
      <rect x="18" y="6" width="11" height="52" rx="5.5" />
      <rect x="8" y="32" width="14" height="6" rx="3" />
      <rect x="8" y="18" width="6" height="20" rx="3" />
      <rect x="25" y="26" width="12" height="6" rx="3" />
      <rect x="31" y="14" width="6" height="18" rx="3" />
      <ellipse cx="48" cy="47" rx="8" ry="11" fill={A2} />
      <ellipse cx="42" cy="32" rx="5" ry="7" transform="rotate(-25 42 32)" fill={A2} />
      <ellipse cx="55" cy="31" rx="4.5" ry="6.5" transform="rotate(25 55 31)" fill={A2} />
      <circle cx="42" cy="24" r="2" fill={A1} />
      <rect x="4" y="57" width="56" height="3" fill={A1} />
    </Icon>
  );
}

export function IconChile(props) {
  return (
    <Icon {...props}>
      <path d="M13 17c-4 20 10 40 38 40 6 0 8-4 4-6-19-3-29-16-31-34Z" />
      <path fill={A2} d="M12 18h13l-1-5h-3c0-5 3-8 7-9l-1-3c-6 1-9 6-9 12h-5Z" />
    </Icon>
  );
}

export function IconTaco(props) {
  return (
    <Icon {...props}>
      <g fill={A2}>
        <circle cx="12" cy="29" r="6" /><circle cx="21" cy="25" r="6" /><circle cx="31" cy="24" r="6" />
        <circle cx="41" cy="25" r="6" /><circle cx="50" cy="29" r="6" />
      </g>
      <g fill={A1}>
        <circle cx="17" cy="26" r="3" /><circle cx="36" cy="23" r="3" /><circle cx="46" cy="25" r="2.6" />
      </g>
      <path fillRule="evenodd" d="M5 30h54a27 27 0 0 1-54 0Zm13 8a2 2 0 1 0 0 .1Zm10 6a2 2 0 1 0 0 .1Zm12-4a2 2 0 1 0 0 .1Zm6 8a2 2 0 1 0 0 .1Z" />
    </Icon>
  );
}

export function IconGuacamole(props) {
  return (
    <Icon {...props}>
      <path d="M36 32L45 5l10 25Z" fill={A1} />
      <path fill={A2} d="M9 35q3-11 14-9 7-7 15-1 11-3 17 10Z" />
      <path fillRule="evenodd" d="M5 34h54q-2 22-27 23Q7 56 5 34Zm9 6l3 5 3-5Zm9 0l3 5 3-5Zm9 0l3 5 3-5Zm9 0l3 5 3-5Z" />
    </Icon>
  );
}

export function IconMargarita(props) {
  return (
    <Icon {...props}>
      <path d="M7 14h50L35.5 33v17H44v5H20v-5h8.5V33Z" />
      <rect x="7" y="11" width="50" height="3.5" fill={A1} />
      <circle cx="51" cy="13" r="9" fill={A2} />
      <path fill="none" stroke={A1} strokeWidth="1.6" d="M51 6v14M44 13h14M46 8l10 10M56 8L46 18" />
    </Icon>
  );
}

export function IconTequila(props) {
  return (
    <Icon {...props}>
      <rect x="26" y="3" width="12" height="6" rx="1" fill={A1} />
      <path d="M28 9h8v9q10 4 10 14v24q0 4-4 4H22q-4 0-4-4V32q0-10 10-14Z" />
      <rect x="21" y="34" width="22" height="16" rx="2" fill={A1} />
      <path fill={A2} d="M32 48l-3-10 3 3 3-3Zm-2 0l-6-6 4 1Zm4 0l6-6-4 1Z" />
    </Icon>
  );
}

const BEAN = 'M0-6C8-8 12-2 10 3 8 8 2 6 0 4-2 6-8 8-10 3-12-2-8-8 0-6Z';

export function IconFrijoles(props) {
  const beans = [
    { x: 18, y: 46, r: -15, c: 'currentColor' },
    { x: 40, y: 48, r: 20, c: A2 },
    { x: 29, y: 32, r: 5, c: A1 },
    { x: 49, y: 30, r: -30, c: 'currentColor' },
    { x: 15, y: 22, r: 35, c: A2 },
    { x: 34, y: 16, r: -10, c: 'currentColor' },
  ];
  return (
    <Icon {...props}>
      {beans.map((b, i) => (
        <path key={i} d={BEAN} fill={b.c} transform={`translate(${b.x} ${b.y}) rotate(${b.r}) scale(1.05)`} />
      ))}
    </Icon>
  );
}

export function IconBigote(props) {
  return (
    <Icon {...props}>
      <path fillRule="evenodd" d="M32 14a20 20 0 1 1 0 40 20 20 0 0 1 0-40Zm-8 18a2.5 2.5 0 1 0 0 .1Zm16 0a2.5 2.5 0 1 0 0 .1Z" />
      <path fill={A1} d="M11 30q1-20 21-20t21 20Z" />
      <path fill={A1} d="M50 22l11-5-2 9Zm1 3l9 5-8 2Z" />
      <g fill={A2}>
        <circle cx="22" cy="20" r="1.6" /><circle cx="32" cy="16" r="1.6" /><circle cx="42" cy="20" r="1.6" />
      </g>
      <path fill={A2} d="M32 41c-4-4-10-3-14 0 0 4 6 7 14 2 8 5 14 2 14-2-4-3-10-4-14 0Z" />
    </Icon>
  );
}

export function IconSol(props) {
  return (
    <Icon {...props}>
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M29 11l3-9 3 9Z" transform={`rotate(${i * 30} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="17" />
      <path fill="none" stroke={A1} strokeWidth="2.4" strokeLinecap="round"
        d="M32 32a2 2 0 1 1 2 2 4.5 4.5 0 1 1 -6.5 -4 7 7 0 1 1 11 6 9.5 9.5 0 1 1 -14 -10" />
    </Icon>
  );
}

export function IconRombo(props) {
  return (
    <Icon {...props}>
      <path fillRule="evenodd" d="M32 2l30 30-30 30L2 32Zm0 9L11 32l21 21 21-21Z" />
      <path fill={A1} d="M32 15l17 17-17 17-17-17Z" />
      <path fill="none" stroke={A2} strokeWidth="3" strokeLinecap="square" d="M23 35v-8h18v10h-12v-5h6" />
    </Icon>
  );
}

export function IconFlor(props) {
  return (
    <Icon {...props}>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx="32" cy="17" rx="8" ry="11" transform={`rotate(${i * 60} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="8" fill={A1} />
      <circle cx="32" cy="32" r="3" fill={A2} />
    </Icon>
  );
}

export function IconJarrito(props) {
  return (
    <Icon {...props}>
      <path fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" d="M48 26q11 1 9 12t-11 9" />
      <path d="M20 14h24v4q-2 2-2 4 10 6 10 18 0 16-20 18-20-2-20-18 0-12 10-18 0-2-2-4Z" />
      <rect x="18" y="11" width="28" height="4.5" rx="1.5" fill={A1} />
      <path fill="none" stroke={A1} strokeWidth="2" d="M15 33l3.4-4 3.4 4 3.4-4 3.4 4 3.4-4 3.4 4 3.4-4 3.4 4 3.4-4 3.4 4" />
      <circle cx="32" cy="45" r="5" fill={A2} />
      <g fill={A1}>
        <circle cx="32" cy="38" r="2" /><circle cx="32" cy="52" r="2" /><circle cx="25" cy="45" r="2" /><circle cx="39" cy="45" r="2" />
      </g>
    </Icon>
  );
}

export function IconMolcajete(props) {
  return (
    <Icon {...props}>
      <rect x="38" y="2" width="9" height="28" rx="4.5" transform="rotate(28 42 16)" fill={A1} />
      <ellipse cx="32" cy="27" rx="25" ry="4.5" fill={A2} />
      <path fillRule="evenodd" d="M6 27h52q-2 20-26 22Q8 47 6 27Zm12 8a1.6 1.6 0 1 0 0 .1Zm9 5a1.6 1.6 0 1 0 0 .1Zm10-4a1.6 1.6 0 1 0 0 .1Zm9 5a1.6 1.6 0 1 0 0 .1Z" />
      <rect x="13" y="44" width="8" height="13" rx="2" />
      <rect x="43" y="44" width="8" height="13" rx="2" />
      <rect x="28" y="47" width="8" height="10" rx="2" />
    </Icon>
  );
}

export function IconMazorca(props) {
  return (
    <Icon {...props}>
      <ellipse cx="32" cy="26" rx="11" ry="22" fill={A1} />
      <path fill="none" stroke="currentColor" strokeWidth="1.4" d="M22 14h20M21.2 20h21.6M21 26h22M21.2 32h21.6M22 38h20M28 5v42M36 5v42" />
      <path d="M32 61Q11 48 12 20q9 18 20 25Z" />
      <path d="M32 61Q53 48 52 20q-9 18-20 25Z" fill={A2} />
    </Icon>
  );
}

export function IconPinata(props) {
  return (
    <Icon {...props}>
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d="M27 24L32 1l5 23Z" fill={i % 2 ? A1 : 'currentColor'} transform={`rotate(${i * (360 / 7)} 32 33)`} />
      ))}
      <circle cx="32" cy="33" r="13" />
      <circle cx="32" cy="33" r="9" fill="none" stroke={A2} strokeWidth="3" strokeDasharray="3 2.4" />
      <circle cx="32" cy="33" r="4" fill={A1} />
    </Icon>
  );
}

export function IconCempasuchil(props) {
  return (
    <Icon {...props}>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="32" cy="15" rx="5.5" ry="12" transform={`rotate(${i * 30} 32 32)`} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={`b${i}`} cx="32" cy="22" rx="4" ry="8" fill={A1} transform={`rotate(${i * 36 + 18} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="5" fill={A2} />
    </Icon>
  );
}

export function IconSandia(props) {
  return (
    <Icon {...props}>
      <path d="M3 22h58a29 29 0 0 1-58 0Z" />
      <rect x="7" y="22" width="50" height="2" fill={A1} />
      <path fillRule="evenodd" fill={A2} d="M8 24h48a24 24 0 0 1-48 0Zm12 6a1.6 2.6 0 1 0 0 .1Zm9 7a1.6 2.6 0 1 0 0 .1Zm8-8a1.6 2.6 0 1 0 0 .1Zm8 6a1.6 2.6 0 1 0 0 .1Zm-17 9a1.6 2.6 0 1 0 0 .1Zm10 0a1.6 2.6 0 1 0 0 .1Z" />
    </Icon>
  );
}

// Banderin de papel picado con recortes
function Banderin({ color }) {
  return (
    <svg viewBox="0 0 40 48" className="mx-banderin" style={{ color }} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M0 0h40v32L20 47 0 32ZM20 8l5 6-5 6-5-6Zm-11 4a2.5 2.5 0 1 0 0 .1Zm22 0a2.5 2.5 0 1 0 0 .1ZM20 24a3 3 0 1 0 0 .1ZM8 22l4 4-4 4-4-4Zm24 0l4 4-4 4-4-4Z"
      />
    </svg>
  );
}

const COLORES = ['var(--rojo)', 'var(--amarillo)', 'var(--verde)'];

export function Guirnalda({ count = 22 }) {
  return (
    <div className="mx-guirnalda" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="mx-banderin-wrap" style={{ animationDelay: `${(i % 5) * -0.6}s` }}>
          <Banderin color={COLORES[i % 3]} />
        </span>
      ))}
    </div>
  );
}

// Separador tipo sarape: patron SVG repetible, usable entre secciones
export function Sarape({ className = '' }) {
  return (
    <svg className={`mx-sarape ${className}`} aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <defs>
        <pattern id="mx-sarape-pat" width="48" height="28" patternUnits="userSpaceOnUse">
          <rect width="48" height="28" fill="var(--rojo)" />
          <rect y="0" width="48" height="4" fill="var(--amarillo)" />
          <rect y="24" width="48" height="4" fill="var(--amarillo)" />
          <path d="M0 4l6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6v2l-6 6-6-6-6 6-6-6-6 6-6-6-6 6-6-6Z" fill="var(--verde)" />
          <path d="M0 24l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6v-2l-6-6-6 6-6-6-6 6-6-6-6 6-6-6-6 6Z" fill="var(--verde)" />
          <path d="M24 8l6 6-6 6-6-6Z" fill="var(--amarillo)" />
          <path d="M24 11l3 3-3 3-3-3Z" fill="var(--verde)" />
          <path d="M0 11l3 3-3 3Zm48 0l-3 3 3 3Z" fill="var(--amarillo)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mx-sarape-pat)" />
    </svg>
  );
}

// Iconos esparcidos por el fondo del hero (posiciones en %, tamano en px, m = visible en movil)
const CAMPO = [
  // banda superior
  { I: IconSol, x: 4, y: 11, s: 92, r: -8, c: 'amarillo', m: true },
  { I: IconCalavera, x: 17, y: 9, s: 74, r: 10, c: 'rojo' },
  { I: IconSombrero, x: 30, y: 11, s: 86, r: -6, c: 'verde', m: true },
  { I: IconLuchador, x: 43, y: 8, s: 70, r: -10, c: 'rojo' },
  { I: IconPinata, x: 56, y: 9, s: 80, r: 8, c: 'amarillo' },
  { I: IconPiramide, x: 70, y: 8, s: 80, r: 0, c: 'verde', m: true },
  { I: IconCempasuchil, x: 84, y: 10, s: 72, r: 0, c: 'amarillo' },
  { I: IconTequila, x: 96, y: 10, s: 70, r: 12, c: 'rojo', m: true },
  // costados
  { I: IconGuitarra, x: 3, y: 34, s: 86, r: 14, c: 'rojo' },
  { I: IconJarrito, x: 3, y: 58, s: 78, r: -6, c: 'rojo', m: true },
  { I: IconCactus, x: 4, y: 80, s: 84, r: 0, c: 'verde' },
  { I: IconFlor, x: 27, y: 40, s: 52, r: 0, c: 'amarillo' },
  { I: IconRombo, x: 27, y: 64, s: 54, r: 0, c: 'verde' },
  { I: IconSandia, x: 18, y: 82, s: 64, r: -12, c: 'verde', m: true },
  { I: IconMargarita, x: 98, y: 36, s: 70, r: -10, c: 'verde' },
  { I: IconMazorca, x: 98, y: 62, s: 72, r: 10, c: 'amarillo' },
  // banda inferior
  { I: IconMaracas, x: 30, y: 92, s: 76, r: 0, c: 'amarillo', m: true },
  { I: IconChile, x: 42, y: 93, s: 62, r: -20, c: 'rojo' },
  { I: IconTaco, x: 53, y: 92, s: 76, r: 6, c: 'amarillo', m: true },
  { I: IconBigote, x: 64, y: 93, s: 66, r: 8, c: 'verde' },
  { I: IconBurro, x: 75, y: 92, s: 74, r: -4, c: 'amarillo' },
  { I: IconMolcajete, x: 86, y: 93, s: 64, r: 0, c: 'verde', m: true },
  { I: IconGuacamole, x: 97, y: 86, s: 70, r: 0, c: 'rojo' },
  { I: IconFrijoles, x: 14, y: 95, s: 52, r: 0, c: 'rojo' },
];

const ACENTOS = {
  rojo: ['var(--amarillo)', 'var(--verde)'],
  verde: ['var(--amarillo)', 'var(--rojo)'],
  amarillo: ['var(--rojo)', 'var(--verde)'],
};

export function CampoIconos() {
  return (
    <div className="mx-campo" aria-hidden="true">
      {CAMPO.map(({ I, x, y, s, r, c, m }, i) => (
        <span
          key={i}
          className={m ? 'mx-campo-item mx-campo-movil' : 'mx-campo-item'}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: s,
            height: s,
            transform: `translate(-50%, -50%) rotate(${r}deg)`,
          }}
        >
          <I
            className="mx-flotar"
            style={{
              color: `var(--${c})`,
              '--a1': ACENTOS[c][0],
              '--a2': ACENTOS[c][1],
              animationDuration: `${5 + (i % 4) * 1.3}s`,
              animationDelay: `${(i * -0.9) % 6}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
