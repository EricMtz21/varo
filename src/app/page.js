import FinanceApp from "@/components/features/FinanceApp";
import LoginPage from "@/components/features/LoginPage";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh text-[#E2E8F0]">
      {user ? <FinanceApp initialUser={user} /> : <LoginPage />}
    </div>
  );
}
