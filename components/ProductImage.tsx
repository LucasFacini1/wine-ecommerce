import Image from "next/image";
import type { Wine, WineType } from "@/types";
import { BottlePlate } from "@/components/BottlePlate";
import { cn } from "@/lib/cn";

interface ImageableWine {
  name: string;
  producer: string;
  type: WineType;
  vintage: number | null;
  region: string;
  grapes: string[];
  /** ficha completa (Wine) */
  images?: Wine["images"];
  /** snapshot do carrinho — uma única URL solta */
  imageUrl?: string;
}

interface Props {
  wine: ImageableWine;
  variant?: "bottle" | "label";
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Foto real do produto quando existir; senão a garrafa ilustrada
 * (BottlePlate). A foto só substitui a variante "bottle" — "label" é
 * sempre a ilustração, não tem equivalente em foto.
 */
export function ProductImage({
  wine,
  variant = "bottle",
  priority,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  className,
}: Props) {
  const photo = wine.images?.[0] ?? (wine.imageUrl ? { url: wine.imageUrl, alt: wine.name } : undefined);

  if (photo?.url && variant === "bottle") {
    return (
      <Image
        src={photo.url}
        alt={photo.alt || wine.name}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <BottlePlate
      wine={wine}
      variant={variant}
      priority={priority}
      className={className}
    />
  );
}
