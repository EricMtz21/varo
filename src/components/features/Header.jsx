"use client";

import {
  MoonIcon,
  PlusIcon,
  SignOutIcon,
  SunIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogoWords } from "@/components/ui/LogoWords";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function Header({
  activeTab,
  onAddClick,
  user,
  darkMode,
  onToggleDark,
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isMenuOpen) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsExiting(false);
    }, 260);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";
  const email = user?.email;

  return (
    <>
      <header className="sticky top-0 z-20 px-3 py-3 bg-background">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <LogoWords className="h-auto w-18 text-foreground" />

          <div className="flex items-center gap-2">
            <button
              onClick={onAddClick}
              className="hidden sm:flex items-center gap-1.5 bg-foreground hover:bg-foreground/90 text-background text-sm px-3 py-2 rounded-xl transition-colors cursor-pointer active:scale-95"
              aria-label="Agregar"
            >
              <PlusIcon size={18} />
              <span className="font-bold">
                {activeTab === "savings" ? "Caja" : "Nuevo"}
              </span>
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-9 h-9 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer transition-transform active:scale-95 shrink-0"
              aria-label="Abrir perfil"
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-xs font-semibold">
                  {fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      {/* Menú lateral (Sidebar / Drawer) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${isExiting ? "animate-fade-out" : "animate-fade-in"}`}
            onClick={closeMenu}
          />
          <div
            className={`relative w-[80%] max-w-sm h-dvh bg-background border-r border-border flex flex-col ${isExiting ? "animate-slide-out-left" : "animate-slide-in-left"}`}
          >
            {/* Cabecera del Perfil */}
            <div className="p-6 border-b border-border bg-card pt-8">
              <div className="flex justify-between items-start mb-5">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 shadow-sm">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon size={32} className="text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <XIcon size={20} />
                </button>
              </div>
              <h2 className="font-bold text-xl text-foreground truncate">
                {fullName}
              </h2>
              <p className="text-sm text-muted-foreground font-medium truncate mt-0.5">
                {email}
              </p>
            </div>

            {/* Opciones o Información Adicional */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <button
                onClick={onToggleDark}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary text-foreground hover:bg-muted transition-colors cursor-pointer active:scale-95"
              >
                {darkMode ? (
                  <SunIcon size={20} className="text-foreground" />
                ) : (
                  <MoonIcon size={20} className="text-foreground" />
                )}
                <span className="font-medium text-sm">
                  {darkMode ? "Modo claro" : "Modo oscuro"}
                </span>
              </button>
            </div>

            {/* Pie / Botón de Cerrar Sesión */}
            <div className="p-4 border-t border-border bg-background">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-destructive/10 text-destructive p-3.5 rounded-xl font-bold transition-colors cursor-pointer active:scale-95"
              >
                <SignOutIcon size={20} weight="bold" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
