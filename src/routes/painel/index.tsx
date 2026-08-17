import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  STATUS_LABEL,
  STATUS_TOM,
  STATUS_LISTA,
  moeda,
  dataBR,
  type OsStatus,
} from "@/lib/dominio";

export const Route = createFileRoute("/painel/")({
  head: () => ({ meta: [{ title: "Dashboard — OficinaPro" }] }),
  component: Dashboard,
});

type OsResumo = {
  id: string;
  numero: number;
  protocolo: string;
  status: OsStatus;
  created_at: string;
  previsao_entrega: string | null;
  cliente: { nome: string } | null;
  veiculo: { placa: string; modelo: string | null } | null;
};

function Dashboard() {
  const { ehEquipe } = useAuth();
  const [ordens, setOrdens] = useState<OsResumo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("ordens_servico")
        .select(
          "id, numero, protocolo, status, created_at, previsao_entrega, cliente:clientes(nome), veiculo:veiculos(placa, modelo)",
        )
        .order("created_at", { ascending: false })
        .limit(20);
      setOrdens((data ?? []) as unknown as OsResumo[]);
      setCarregando(false);
    }
    void carregar();
  }, []);

  const abertas = ordens.filter(
    (o) => o.status !== "entregue" && o.status !== "cancelado",
  );
  const prontas = ordens.filter((o) => o.status === "pronto");
  const emExecucao = ordens.filter((o) => o.status === "em_execucao");

  const cards = [
    {
      icon: ClipboardList,
      label: "OS em aberto",
      value: abertas.length,
      tone: "text-primary",
    },
    { icon: Clock, label: "Em execução", value: emExecucao.length, tone: "text-info" },
    { icon: CheckCircle2, label: "Prontas", value: prontas.length, tone: "text-success" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral das ordens de serviço</p>
        </div>
        <Button asChild>
          <Link to="/painel/ordens/nova">
            <Plus className="mr-1 h-4 w-4" /> Nova OS
          </Link>
        </Button>
      </div>

      {!ehEquipe && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          Seu perfil ainda não foi liberado. Peça ao administrador para atribuir um perfil de
          acesso.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="panel p-6">
            <div className="flex items-center justify-between">
              <c.icon className={`h-6 w-6 ${c.tone}`} />
              <span className="text-3xl font-bold">{c.value}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Ordens recentes</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/painel/ordens">
              Ver todas <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : ordens.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-muted-foreground">Nenhuma ordem de serviço cadastrada ainda.</p>
            <Button asChild className="mt-4">
              <Link to="/painel/ordens/nova">
                <Plus className="mr-1 h-4 w-4" /> Abrir primeira OS
              </Link>
            </Button>
          </div>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">OS</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Veículo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aberta em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ordens.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        to="/painel/ordens/$osId"
                        params={{ osId: o.id }}
                        className="font-medium text-primary hover:underline"
                      >
                        #{o.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.cliente?.nome ?? "—"}</td>
                    <td className="px-4 py-3">
                      {o.veiculo ? `${o.veiculo.placa} · ${o.veiculo.modelo ?? ""}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TOM[o.status]}`}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{dataBR(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
