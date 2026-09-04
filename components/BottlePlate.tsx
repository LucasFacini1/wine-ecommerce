import type { Wine, WineType } from "@/types";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ *
 *  Ilustração de garrafa desenhada em SVG — substitui foto na Fase 1.
 *  Placa clara e quente; o vidro e o líquido variam por tipo de vinho
 *  e a safra é gravada no rótulo. Fase 2 troca por fotografia real
 *  (Wine.images).
 * ------------------------------------------------------------------ */

type Variant = "bottle" | "label";

const GLASS: Record<WineType, { glass: string; wine: string; edge: string }> = {
  tinto: { glass: "#3a1620", wine: "#6e1f2b", edge: "#25101a" },
  branco: { glass: "#63633c", wine: "#d8c684", edge: "#3f3f24" },
  "rosé": { glass: "#8a544c", wine: "#e6a99f", edge: "#5c332e" },
  espumante: { glass: "#2c4034", wine: "#e4d59d", edge: "#1c2a22" },
  laranja: { glass: "#7a5730", wine: "#c8863b", edge: "#4f371c" },
};

const PLATE = { top: "#f3ede1", bottom: "#e8dfcd" };
const CAPSULE = "#6e1f2b";
const LABEL_PAPER = "#faf6ec";

const BOTTLE_PATH =
  "M176,72 L224,72 L224,100 Q224,110 231,120 Q260,160 260,215 L260,434 " +
  "Q260,456 238,456 L162,456 Q140,456 140,434 L140,215 Q140,160 169,120 " +
  "Q176,110 176,100 Z";

interface Props {
  wine: Pick<
    Wine,
    "name" | "producer" | "type" | "vintage" | "region" | "grapes"
  > & { images?: Wine["images"] };
  variant?: Variant;
  priority?: boolean;
  className?: string;
}

export function BottlePlate({ wine, variant = "bottle", className }: Props) {
  const type: WineType = GLASS[wine.type] ? wine.type : "tinto";
  const c = GLASS[type];
  const grapes = wine.grapes ?? [];
  const uid = `${type}-${variant}`;
  const vintageLabel = wine.vintage ? String(wine.vintage) : "S/ SAFRA";
  const alt =
    wine.images?.[0]?.alt ??
    `${wine.name}, ${wine.producer} — ${type} ${vintageLabel}`;

  if (variant === "label") {
    return (
      <svg
        viewBox="0 0 400 500"
        className={cn("block h-full w-full", className)}
        role="img"
        aria-label={alt}
      >
        <rect width="400" height="500" fill="#f1ebde" />
        <rect x="40" y="46" width="320" height="408" fill={LABEL_PAPER} />
        <rect
          x="40"
          y="46"
          width="320"
          height="408"
          fill="none"
          stroke="#00000018"
        />
        <rect
          x="58"
          y="64"
          width="284"
          height="372"
          fill="none"
          stroke="#6e1f2b"
          strokeOpacity="0.45"
        />
        <text
          x="200"
          y="120"
          textAnchor="middle"
          fill="#6b5a3f"
          fontFamily="var(--font-mona), sans-serif"
          fontSize="12"
          letterSpacing="4"
        >
          {wine.producer.toUpperCase()}
        </text>
        <line
          x1="130"
          x2="270"
          y1="140"
          y2="140"
          stroke="#6e1f2b"
          strokeOpacity="0.4"
        />
        <text
          x="200"
          y="228"
          textAnchor="middle"
          fill="#26201a"
          fontFamily="var(--font-fraunces), Georgia, serif"
          fontSize={wine.name.length > 16 ? 30 : 40}
        >
          {wine.name}
        </text>
        <text
          x="200"
          y="286"
          textAnchor="middle"
          fill="#6e1f2b"
          fontFamily="var(--font-fraunces), Georgia, serif"
          fontSize="58"
          fontWeight="300"
        >
          {vintageLabel}
        </text>
        <text
          x="200"
          y="352"
          textAnchor="middle"
          fill="#6b5a3f"
          fontFamily="var(--font-newsreader), Georgia, serif"
          fontSize="16"
          fontStyle="italic"
        >
          {grapes.join(" · ")}
        </text>
        <text
          x="200"
          y="392"
          textAnchor="middle"
          fill="#6b5a3f"
          fontFamily="var(--font-mona), sans-serif"
          fontSize="11"
          letterSpacing="3"
        >
          {wine.region.toUpperCase()}
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 400 500"
      className={cn("block h-full w-full", className)}
      role="img"
      aria-label={alt}
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="34%" r="78%">
          <stop offset="0%" stopColor={PLATE.top} />
          <stop offset="100%" stopColor={PLATE.bottom} />
        </radialGradient>
        <clipPath id={`bottle-${uid}`}>
          <path d={BOTTLE_PATH} />
        </clipPath>
        <linearGradient id={`glass-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={c.glass} stopOpacity="0.82" />
          <stop offset="44%" stopColor={c.glass} />
          <stop offset="100%" stopColor={c.edge} />
        </linearGradient>
      </defs>

      <rect width="400" height="500" fill={`url(#bg-${uid})`} />
      {/* sombra no chão */}
      <ellipse cx="200" cy="461" rx="86" ry="12" fill="#3a2a1e" opacity="0.14" />

      {/* corpo do vidro */}
      <path d={BOTTLE_PATH} fill={`url(#glass-${uid})`} />

      {/* líquido visível através do vidro */}
      <g clipPath={`url(#bottle-${uid})`}>
        <rect
          x="130"
          y="150"
          width="140"
          height="330"
          fill={c.wine}
          opacity="0.92"
        />
        <rect x="150" y="150" width="12" height="330" fill="#fff" opacity="0.16" />
        <rect x="243" y="150" width="10" height="330" fill="#000" opacity="0.22" />
        {type === "espumante" && (
          <g fill="#fff" opacity="0.55">
            <circle cx="205" cy="300" r="1.6" />
            <circle cx="214" cy="340" r="1.3" />
            <circle cx="198" cy="360" r="1.1" />
            <circle cx="220" cy="380" r="1.5" />
          </g>
        )}
      </g>

      {/* contorno */}
      <path
        d={BOTTLE_PATH}
        fill="none"
        stroke="#1c1109"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />

      {/* cápsula */}
      <rect x="172" y="56" width="56" height="30" rx="1.5" fill={CAPSULE} />
      <rect x="170" y="84" width="60" height="7" fill={CAPSULE} />
      <rect x="172" y="56" width="9" height="35" fill="#fff" opacity="0.14" />

      {/* rótulo */}
      <g>
        <rect
          x="150"
          y="296"
          width="100"
          height="132"
          fill={LABEL_PAPER}
          stroke="#00000014"
        />
        <text
          x="200"
          y="322"
          textAnchor="middle"
          fill="#6b5a3f"
          fontFamily="var(--font-mona), sans-serif"
          fontSize="7.5"
          letterSpacing="1.6"
        >
          {wine.producer.toUpperCase()}
        </text>
        <line
          x1="166"
          x2="234"
          y1="330"
          y2="330"
          stroke="#6e1f2b"
          strokeOpacity="0.4"
        />
        <text
          x="200"
          y="360"
          textAnchor="middle"
          fill="#26201a"
          fontFamily="var(--font-fraunces), Georgia, serif"
          fontSize={wine.name.length > 15 ? 11 : 14}
        >
          {wine.name}
        </text>
        <text
          x="200"
          y="402"
          textAnchor="middle"
          fill="#6e1f2b"
          fontFamily="var(--font-fraunces), Georgia, serif"
          fontSize="24"
          fontWeight="300"
        >
          {vintageLabel}
        </text>
      </g>
    </svg>
  );
}
