import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Wrench, Search } from "lucide-react";
import { consultarPortal, type PortalResultado } from "@/lib/portal.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  STATUS_LABEL,
  STATUS_TOM,
  FASES,
  FASE_LABEL,
  moeda,
  dataBR,
  dataHoraBR,
  totalItens,
  type OsStatus,
} from "@/lib/dominio";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Acompanhar Ordem de Serviço — OficinaPro" },
      {
        name: "description",
        content:
          "Consulte o andamento do serviço do seu veículo com o protocolo e a senha recebidos.",
      },
      { property: "og:title", content: "Acompanhar Ordem de Serviço — OficinaPro" },
      {
        property: "og:description",
        content: "Veja etapas, fotos e valores do serviço do seu veículo.",
      },
    ],
  }),
  component: Portal,
});

function Portal() {
  const consultar = useServerFn(consultarPortal);
  const [protocolo, setProtocolo] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<PortalResultado | null>(null);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      const r = await consultar({ data: { protocolo, senha } });
      setResultado(r);
    } catch {
      setResultado({ erro: "Falha na consulta. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  const os = resultado?.os;
  const itens = resultado?.itens ?? [];
  const total = totalItens(
    itens.map((i) => ({
      tipo: i.tipo as "servico" | "produto",
      descricao: i.descricao,
      quantidade: i.quantidade,
      valor_unitario: i.valor_unitario,
    })),
  );
  const desconto = Number(os?.desconto ?? 0);

  return (
    <div className="surface-grid min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <span className="font-display text-xl">OficinaPro</span>
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Área da equipe</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24">
        <h1 className="text-4xl md:text-5xl">Acompanhe seu serviço</h1>
        <p className="mt-2 text-muted-foreground">
          Informe o protocolo e a senha que você recebeu para ver tudo que está sendo feito no seu
          veículo.
        </p>

        <form onSubmit={buscar} className="panel mt-8 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="protocolo">Protocolo</Label>
            <Input
              id="protocolo"
              placeholder="OS2026-XXXXX"
              required
              value={protocolo}
              onChange={(e) => setProtocolo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              placeholder="000000"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={carregando} className="w-full">
              <Search className="mr-1 h-4 w-4" /> Consultar
            </Button>
          </div>
        </form>

        {resultado?.erro && (
          <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {resultado.erro}
          </p>
        )}

        {os && (
          <div className="mt-8 space-y-6">
            <div className="panel p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-3xl">OS #{os.numero}</h2>
                  <p className="text-sm text-muted-foreground">
                    Aberta em {dataBR(os.created_at)} · Protocolo {os.protocolo}
                  </p>
                </div>
                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${STATUS_TOM[os.status as OsStatus]}`}
                >
                  {STATUS_LABEL[os.status as OsStatus]}
                </span>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Cliente</dt>
                  <dd className="font-medium">{resultado?.cliente?.nome ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Veículo</dt>
                  <dd className="font-medium">
                    {resultado?.veiculo
                      ? `${resultado.veiculo.placa} · ${resultado.veiculo.marca ?? ""} ${resultado.veiculo.modelo ?? ""}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Previsão de entrega</dt>
                  <dd className="font-medium">{dataBR(os.previsao_entrega)}</dd>
                </div>
              </dl>

              {os.descricao && <p className="mt-6 text-sm text-muted-foreground">{os.descricao}</p>}
            </div>

            <div className="panel p-6">
              <h3 className="font-display text-2xl">Serviços e produtos</h3>
              <div className="mt-4 divide-y divide-border">
                {itens.map((i, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium">{i.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.tipo === "produto" ? "Produto" : "Serviço"}
                        {i.local_peca ? ` · ${i.local_peca}` : ""} · Qtd {Number(i.quantidade)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {moeda(Number(i.quantidade) * Number(i.valor_unitario))}
                    </span>
                  </div>
                ))}
                {itens.length === 0 && (
                  <p className="py-3 text-sm text-muted-foreground">Nenhum item lançado ainda.</p>
                )}
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-semibold">
                <span>Total {desconto > 0 ? `(desconto ${moeda(desconto)})` : ""}</span>
                <span className="text-primary">{moeda(total - desconto)}</span>
              </div>
            </div>

            <div className="panel p-6">
              <h3 className="font-display text-2xl">Andamento</h3>
              <ol className="mt-4 space-y-3">
                {(resultado?.historico ?? []).map((h, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{STATUS_LABEL[h.status as OsStatus]}</p>
                      <p className="text-xs text-muted-foreground">{dataHoraBR(h.created_at)}</p>
                      {h.comentario && <p className="text-sm">{h.comentario}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="panel p-6">
              <h3 className="font-display text-2xl">Fotos</h3>
              <div className="mt-4 space-y-6">
                {FASES.map((fase) => {
                  const fotos = (resultado?.fotos ?? []).filter((f) => f.fase === fase);
                  if (fotos.length === 0) return null;
                  return (
                    <div key={fase}>
                      <p className="text-sm font-semibold text-primary uppercase">
                        {FASE_LABEL[fase]}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {fotos.map((f, idx) => (
                          <img
                            key={idx}
                            src={f.url}
                            alt={f.legenda ?? `Foto ${FASE_LABEL[fase]} do serviço`}
                            loading="lazy"
                            className="aspect-square w-full rounded-lg border border-border object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                {(resultado?.fotos ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma foto publicada ainda.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
