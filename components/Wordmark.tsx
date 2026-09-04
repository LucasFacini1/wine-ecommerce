import { cn } from "@/lib/cn";

/**
 * Marca da casa. O "Ð" (eth) é uma licença gráfica só no logotipo — em
 * qualquer texto legível por máquina (títulos, e-mails, nº de pedido) o
 * nome é "Empório Padox". Troque por "PADOX" aqui se preferir sem o eth.
 */
const MARK = "PAÐOX";

const SIZES = {
  sm: "text-lg",
  md: "text-2xl md:text-[1.75rem]",
  lg: "text-3xl",
} as const;

export function Wordmark({
  size = "md",
  eyebrow = true,
  className,
}: {
  size?: keyof typeof SIZES;
  eyebrow?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      {eyebrow && (
        <span className="font-sans text-[0.5rem] font-medium uppercase tracking-[0.34em] text-bone-faint">
          Empório
        </span>
      )}
      <span
        className={cn(
          "font-display tracking-[0.16em] text-bone",
          SIZES[size],
        )}
      >
        {MARK}
      </span>
    </span>
  );
}
