"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="flex items-center gap-2 font-sans text-sm text-ok">
        <Check size={15} strokeWidth={2} />
        Pronto. Falamos em breve.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.includes("@")) setDone(true);
      }}
      className="flex items-center"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        className={cn(inputClass, "border-r-0")}
      />
      <button
        type="submit"
        aria-label="Assinar newsletter"
        className="grid h-11 w-11 shrink-0 place-items-center border border-line bg-oxblood text-bone transition-colors hover:bg-oxblood-bright"
      >
        <ArrowRight size={16} strokeWidth={1.5} />
      </button>
    </form>
  );
}
