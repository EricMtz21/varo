"use client";

import { createClient } from "@/lib/supabase/client";
import { GoogleLogoIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { LogoFull } from "@/components/ui/LogoFull";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-muted rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm animate-fade-up">
        <div className="mb-6 bg-card p-4 rounded-3xl shadow-sm border border-border">
          <LogoFull className="h-auto w-32 text-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
          Bienvenido
        </h1>
        <p className="text-muted-foreground mb-10 text-center font-medium text-sm leading-relaxed max-w-65">
          Tus finanzas claras,<br /> decisiones inteligentes.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-foreground text-background hover:bg-foreground/90 px-6 py-4 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-muted-foreground border-t-current rounded-full animate-spin" />
          ) : (
            <GoogleLogoIcon size={22} weight="bold" />
          )}
          <span>{loading ? "Conectando..." : "Continuar con Google"}</span>
        </button>
      </div>
    </div>
  );
}
