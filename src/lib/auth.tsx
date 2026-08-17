import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Perfil } from "@/lib/dominio";

type AuthState = {
  user: User | null;
  session: Session | null;
  perfis: Perfil[];
  carregando: boolean;
  temPerfil: (...p: Perfil[]) => boolean;
  podeEscrever: boolean;
  ehEquipe: boolean;
  recarregarPerfis: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarPerfis(userId: string | undefined) {
    if (!userId) {
      setPerfis([]);
      return;
    }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setPerfis((data ?? []).map((r) => r.role as Perfil));
  }

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!ativo) return;
      setSession(data.session);
      await carregarPerfis(data.session?.user.id);
      setCarregando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_OUT") {
        setPerfis([]);
        return;
      }
      if (s?.user) void carregarPerfis(s.user.id);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const valor = useMemo<AuthState>(() => {
    const temPerfil = (...p: Perfil[]) => p.some((x) => perfis.includes(x));
    return {
      user: session?.user ?? null,
      session,
      perfis,
      carregando,
      temPerfil,
      podeEscrever: temPerfil("admin", "atendente", "tecnico", "recepcao", "financeiro"),
      ehEquipe: perfis.length > 0,
      recarregarPerfis: () => carregarPerfis(session?.user.id),
    };
  }, [session, perfis, carregando]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
