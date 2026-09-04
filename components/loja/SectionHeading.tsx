import Link from "next/link";
import { cn } from "@/lib/cn";

export function SectionHeading({
  label,
  title,
  link,
  className,
}: {
  label: string;
  title: string;
  link?: { href: string; text: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5",
        className,
      )}
    >
      <div>
        <p className="label label-brass">{label}</p>
        <h2 className="mt-2 font-display text-3xl leading-none text-bone md:text-4xl">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="link-underline font-sans text-[0.72rem] uppercase tracking-[0.16em] text-bone-dim hover:text-bone"
        >
          {link.text}
        </Link>
      )}
    </div>
  );
}
