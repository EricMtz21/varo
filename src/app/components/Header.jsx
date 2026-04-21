"use client";

import { PlusIcon, SignOutIcon, UserIcon, XIcon } from "@phosphor-icons/react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header({ activeTab, onAddClick, user }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Bloquear el scroll cuando el menú está abierto
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
    }, 260); // Duración de la animación
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  // Información del usuario desde el provedor de OAuth
  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";
  const email = user?.email;

  return (
    <>
      <header className="sticky top-0 z-20 px-5 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-[#E2E8F0] tracking-tight">
              Varo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-9 h-9 rounded-full overflow-hidden bg-[#1E2D45] flex items-center justify-center cursor-pointer transition-transform active:scale-95 shrink-0"
              aria-label="Abrir perfil"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon size={18} className="text-[#94A3B8]" />
              )}
            </button>
            <button
              onClick={onAddClick}
              className="hidden sm:flex items-center gap-1.5 bg-[#818CF8] hover:bg-[#6D75E8] text-[#07090F] text-sm p-2 rounded-xl transition-colors cursor-pointer active:scale-95"
              aria-label="Agregar"
            >
              <PlusIcon size={18} />
              <span className="font-bold">
                {activeTab === "savings" ? "Caja" : "Nuevo"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menú lateral (Sidebar / Drawer) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${isExiting ? "animate-fade-out" : "animate-fade-in"}`}
            onClick={closeMenu}
          />
          <div
            className={`relative w-[80%] max-w-sm h-[100dvh] bg-[#0C1220] border-r border-[#1E2D45] flex flex-col ${isExiting ? "animate-slide-out-left" : "animate-slide-in-left"}`}
          >
            {/* Cabecera del Perfil */}
            <div className="p-6 border-b border-[#1E2D45] bg-[#07090F] pt-8">
              <div className="flex justify-between items-start mb-5">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1E2D45] flex items-center justify-center shrink-0 shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon size={32} className="text-[#94A3B8]" />
                  )}
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1A2537] transition-colors cursor-pointer"
                >
                  <XIcon size={20} />
                </button>
              </div>
              <h2 className="font-bold text-xl text-[#E2E8F0] truncate">
                {fullName}
              </h2>
              <p className="text-sm text-[#64748B] font-medium truncate mt-0.5">
                {email}
              </p>
            </div>

            {/* Opciones o Información Adicional */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"></div>

            {/* Pie / Botón de Cerrar Sesión */}
            <div className="p-4 border-t border-[#1E2D45] bg-[#0F1421]">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-[#1A2537] hover:bg-[#F87171]/10 text-[#F87171] p-3.5 rounded-xl font-bold transition-colors cursor-pointer active:scale-95"
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
