import { cookies } from "next/headers";
import FinanceApp from "@/components/features/FinanceApp";
import LoginPage from "@/components/features/LoginPage";
import { ToastProvider } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/server";

const TABS = ["movements", "cards", "savings"];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // La pestaña y el tema viajan en cookie para que el servidor pinte ya la
  // vista correcta: leerlos de localStorage provocaba un parpadeo al abrir.
  const cookieStore = await cookies();
  const savedTab = cookieStore.get("activeTab")?.value;
  const initialTab = TABS.includes(savedTab) ? savedTab : "movements";
  const initialTheme = cookieStore.get("theme")?.value ?? "system";

  return (
    <div className="min-h-dvh text-[#E2E8F0]">
      {user ? (
        <ToastProvider>
          <FinanceApp
            initialUser={user}
            initialTab={initialTab}
            initialTheme={initialTheme}
          />
        </ToastProvider>
      ) : (
        <LoginPage />
      )}
    </div>
  );
}
