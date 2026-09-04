"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wine } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export function LoginForm({
  storeHref,
  onAdminHost,
}: {
  storeHref: string;
  onAdminHost: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("proximo") ?? (onAdminHost ? "/" : "/admin");
  const preErro =
    params.get("erro") === "sem-acesso"
      ? "Sua conta não tem acesso ao painel."
      : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(preErro);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }
    router.replace(next);
    router.refresh();
  };

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <Wine size={20} strokeWidth={1.5} className="text-oxblood" />
          <Wordmark size="sm" eyebrow={false} />
          <span className="label ml-auto">admin</span>
        </div>

        <h1 className="font-display text-3xl text-bone">Entrar no painel</h1>
        <p className="mt-2 font-sans text-sm text-bone-dim">
          Acesso restrito à equipe da adega.
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <Field
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <Field
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && (
            <p className="border border-danger/40 bg-danger-bg px-3 py-2 font-sans text-xs text-danger">
              {error}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={loading}
          >
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <Link
          href={storeHref}
          className="mt-8 block font-sans text-[0.72rem] uppercase tracking-[0.16em] text-bone-faint hover:text-bone"
        >
          ← Voltar à loja
        </Link>
      </div>
    </div>
  );
}
