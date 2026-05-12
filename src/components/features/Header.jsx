"use client";

import {
  MonitorIcon,
  MoonIcon,
  PlusIcon,
  SignOutIcon,
  SunIcon,
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
  theme,
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
            className={`relative w-[72%] max-w-xs h-dvh bg-background border-r border-border flex flex-col ${isExiting ? "animate-slide-out-left" : "animate-slide-in-left"}`}
          >
            {/* Perfil */}
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={avatarUrl} referrerPolicy="no-referrer" />
                  <AvatarFallback className="text-xs font-semibold">
                    {fullName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">
                    {fullName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate leading-tight">
                    {email}
                  </p>
                </div>
              </div>
              <button
                onClick={closeMenu}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Opciones */}
            <div className="flex-1 p-3">
              <button
                onClick={onToggleDark}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-sm"
              >
                {theme === "dark" ? (
                  <MoonIcon size={16} />
                ) : theme === "light" ? (
                  <SunIcon size={16} />
                ) : (
                  <MonitorIcon size={16} />
                )}
                <span>
                  {theme === "dark" ? "Oscuro" : theme === "light" ? "Claro" : "Sistema"}
                </span>
              </button>
            </div>

            {/* Cerrar sesión */}
            <div className="p-3 border-t border-border">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-end gap-2.5 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer text-sm"
              >
                <span>Cerrar sesión</span>
                <SignOutIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
