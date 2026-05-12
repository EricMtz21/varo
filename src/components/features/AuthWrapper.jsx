"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loginTempUser() {
      // 1. Verificar si ya hay una sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsAuthenticated(true);
        return;
      }

      // 2. Si no hay sesión, iniciar sesión con el usuario temporal
      // NOTA: Reemplazar estas credenciales con el usuario que crees en tu Supabase Dashboard
      const { error } = await supabase.auth.signInWithPassword({
        email: "test@temporal.com",
        password: "password123",
      });

      if (error) {
        console.error("Error al iniciar sesión temporal:", error.message);
      } else {
        setIsAuthenticated(true);
      }
    }

    loginTempUser();
  }, [supabase]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#07090F] text-[#E2E8F0] font-bold">
        Conectando usuario temporal...
      </div>
    );
  }

  return children;
}
