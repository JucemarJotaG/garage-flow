import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STATUS_LABEL,
  STATUS_LISTA,
  STATUS_TOM,
  dataBR,
  type OsStatus,
} from "@/lib/dominio";

export const Route = createFileRoute("/painel/ordens/")({
  head: () => ({ meta: [{ title: "Ordens de Serviço — OficinaPro" }] }),
  component: OrdensList,
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

function OrdensList() {
  const [ordens, setOrdens] = useState<OsResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("ordens_servico")
        .select(
          "id, numero, protocolo, status, created_at, previsao_entrega, cliente:clientes(nome), veiculo:veiculos(placa, modelo)",
        )
        .order("created_at", { ascending: false });
      setOrdens((data ?? []) as unknown as OsResumo[]);
      setCarregando(false);
    }
    void carregar();
  }, []);

  const filtradas = useMemo(() => {
    return ordens.filter((o) => {
      if (filtroStatus !== "todos" && o.status !== filtroStatus) return false;
      if (!busca.trim()) return true;
      const q = busca.toLowerCase();
      return (
        String(o.numero).includes(q) ||
        o.protocolo.toLowerCase().includes(q) ||
        (o.cliente?.nome ?? "").toLowerCase().includes(q) ||
        (o.veiculo?.placa ?? "").toLowerCase().includes(q)
      );
    });
  }, [ordens, busca, filtroStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground">
            {ordens.length} ordem(ns) no total
          </p>
        </div>
        <Button asChild>
          <Link to="/painel/ordens/nova">
            <Plus className="mr-1 h-4 w-4" /> Nova OS
          </Link>
        </Button>
      </div>

      <div className="panel flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, protocolo, cliente ou placa…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-1 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {STATUS_LISTA.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {carregando ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : filtradas.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-muted-foreground">Nenhuma OS encontrada com esses filtros.</p>
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3">OS</th>
                <th className="px-4 py-3">Protocolo</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Veículo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Previsão</th>
                <th className="px-4 py-3">Aberta em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtradas.map((o) => (
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
                  <td className="px-4 py-3 font-mono text-xs">{o.protocolo}</td>
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
                  <td className="px-4 py-3 text-muted-foreground">{dataBR(o.previsao_entrega)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dataBR(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
