"use client";

import Beams from "@/components/Beams";
import { createClient } from "../../utils/supabase/client";
import { GoogleLogoIcon } from "@phosphor-icons/react";
import { useState } from "react";

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
    <div className="flex flex-col min-h-dvh p-4">
      {/* ── Background ────────────────────────── */}
      <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden bg-[#07090F]">
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#a1b5ff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
      <h1 className="text-5xl font-black mt-8 mb-2 text-[#E2E8F0] tracking-tight pl-2">
        Varo
      </h1>
      <p className="text-[#acafb4] mb-8 font-medium text-sm pl-2">
        Tus finanzas claras,
        <br /> decisiones inteligentes.
      </p>
      <div className="flex-1 flex items-end p-2 max-w-sm w-full animate-fade-up">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#07090F] hover:bg-gray-200 px-6 py-4 rounded-sm font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-gray-400 border-t-[#07090F] rounded-full animate-spin" />
          ) : (
            <GoogleLogoIcon size={22} weight="bold" color="#07090F" />
          )}
          <span>{loading ? "Conectando..." : "Iniciar con Google"}</span>
        </button>
      </div>
    </div>
  );
}
