import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  Users,
  Car,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@components/ui/button";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [{ title: "Painel — OficinaPro" }],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
  component: PainelLayout,
});

const NAV = [
  { to: "/painel", label: "Dashboard", icon: LayoutDashboard },
  { to: "/painel/ordens", label: "Ordens de Serviço", icon: ClipboardList },
  { to: "/painel/clientes", label: "Clientes", icon: Users },
  { to: "/painel/veiculos", label: "Veículos", icon: Car },
  { to: "/painel/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/painel/configuracoes", label: "Configurações", icon: Settings },
];

function PainelLayout() {
  const { user, carregando, ehEquipe } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!carregando && !user) void navigate({ to: "/auth", replace: true });
  }, [user, carregando, navigate]);

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </div>
    );
  }
  if (!user) return null;

  async function sair() {
    await supabase.auth.signOut();
    void navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex items-center gap-2 px-6 py-6">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="font-display text-2xl text-sidebar-foreground">OficinaPro</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{user.email}</p>
          <p className="text-xs text-sidebar-foreground/60">
            {ehEquipe ? "Equipe" : "Sem perfil"}
          </p>
          <Button variant="ghost" size="sm" className="mt-3 w-full justify-start" onClick={sair}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <span className="font-display text-xl">OficinaPro</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMenuAberto(!menuAberto)}>
          {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {menuAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMenuAberto(false)}>
          <div
            className="absolute left-0 top-0 h-full w-64 bg-sidebar p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <Button variant="ghost" size="sm" className="mt-4 w-full justify-start" onClick={sair}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      )}

      <main className="min-h-screen overflow-x-hidden p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
