import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DollarSign, ClipboardList, TrendingUp, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
  STATUS_LABEL,
  STATUS_LISTA,
  moeda,
  type OsStatus,
} from "@/lib/dominio";

export const Route = createFileRoute("/painel/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — OficinaPro" }] }),
  component: RelatoriosPage,
});

const CORES_GRAFICO = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-primary)",
  "var(--color-info)",
];

type OsResumo = {
  id: string;
  numero: number;
  status: OsStatus;
  desconto: number;
  created_at: string;
};

type ItemResumo = {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
};

function RelatoriosPage() {
  const [carregando, setCarregando] = useState(true);
  const [ordens, setOrdens] = useState<OsResumo[]>([]);
  const [itens, setItens] = useState<ItemResumo[]>([]);

  useEffect(() => {
    async function carregar() {
      const { data: osData } = await supabase
        .from("ordens_servico")
        .select("id, numero, status, desconto, created_at")
        .order("created_at", { ascending: false });
      setOrdens((osData ?? []) as OsResumo[]);

      const { data: itensData } = await supabase
        .from("os_itens")
        .select("descricao, quantidade, valor_unitario")
        .order("created_at", { ascending: false })
        .limit(500);
      setItens((itensData ?? []) as ItemResumo[]);

      setCarregando(false);
    }
    void carregar();
  }, []);

  const totalOs = ordens.length;
  const osAbertas = ordens.filter(
    (o) => o.status !== "entregue" && o.status !== "cancelado",
  ).length;
  const faturamentoTotal = itens.reduce(
    (acc, i) => acc + Number(i.quantidade) * Number(i.valor_unitario),
    0,
  );

  const porStatus = STATUS_LISTA.map((s) => ({
    status: s,
    label: STATUS_LABEL[s],
    quantidade: ordens.filter((o) => o.status === s).length,
  })).filter((d) => d.quantidade > 0);

  const porMes = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const mes = d.toLocaleDateString("pt-BR", { month: "short" });
    const ano = d.getFullYear();
    const count = ordens.filter((o) => {
      const od = new Date(o.created_at);
      return od.getMonth() === d.getMonth() && od.getFullYear() === ano;
    }).length;
    return { mes: mes.charAt(0).toUpperCase() + mes.slice(1), os: count };
  });

  const rankingServicos = itens
    .reduce<{ nome: string; quantidade: number; valor: number }[]>((acc, i) => {
      const existente = acc.find((a) => a.nome === i.descricao);
      if (existente) {
        existente.quantidade += Number(i.quantidade);
        existente.valor += Number(i.quantidade) * Number(i.valor_unitario);
      } else {
        acc.push({
          nome: i.descricao,
          quantidade: Number(i.quantidade),
          valor: Number(i.quantidade) * Number(i.valor_unitario),
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);

  const cards = [
    { icon: ClipboardList, label: "Total de OS", value: String(totalOs), tone: "text-primary" },
    { icon: TrendingUp, label: "OS em aberto", value: String(osAbertas), tone: "text-info" },
    { icon: DollarSign, label: "Faturamento", value: moeda(faturamentoTotal), tone: "text-success" },
  ];

  if (carregando) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Visão gerencial da operação</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="panel p-6">
            <div className="flex items-center justify-between">
              <c.icon className={`h-6 w-6 ${c.tone}`} />
              <span className="text-2xl font-bold">{c.value}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="mb-4 text-lg font-semibold">OS por mês (últimos 6 meses)</h2>
          {porMes.every((m) => m.os === 0) ? (
            <p className="text-sm text-muted-foreground">Sem dados suficientes ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={porMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="os" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel p-6">
          <h2 className="mb-4 text-lg font-semibold">OS por status</h2>
          {porStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados suficientes ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={porStatus}
                  dataKey="quantidade"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry: { label: string; quantidade: number }) =>
                    `${entry.label}: ${entry.quantidade}`
                  }
                >
                  {porStatus.map((_, idx) => (
                    <Cell key={idx} fill={CORES_GRAFICO[idx % CORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="mb-4 text-lg font-semibold">Ranking de serviços e produtos</h2>
        {rankingServicos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item lançado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Qtd</th>
                  <th className="px-4 py-3">Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rankingServicos.map((s, idx) => (
                  <tr key={idx} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{s.nome}</td>
                    <td className="px-4 py-3">{s.quantidade}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{moeda(s.valor)}</td>
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
