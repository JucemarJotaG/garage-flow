import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wrench,
  Mic,
  Camera,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  Car,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OficinaPro — Ordens de Serviço para o ramo automotivo" },
      {
        name: "description",
        content:
          "Abra ordens de serviço por voz ou digitação, registre fotos antes/durante/depois, avise o cliente no WhatsApp e acompanhe tudo por placa.",
      },
      { property: "og:title", content: "OficinaPro — Ordens de Serviço para o ramo automotivo" },
      {
        property: "og:description",
        content:
          "Gestão completa para oficina mecânica, martelinho de ouro e estética automotiva.",
      },
    ],
  }),
  component: Index,
});

const RECURSOS = [
  {
    icone: Mic,
    titulo: "Abertura por voz",
    texto:
      "Fale o comando e o assistente cria a OS, cadastra o cliente e lança serviços, produtos e valores.",
  },
  {
    icone: Camera,
    titulo: "Fotos antes / durante / depois",
    texto: "Registro visual de cada etapa, guardado com segurança e visível ao cliente.",
  },
  {
    icone: MessageCircle,
    titulo: "WhatsApp em cada status",
    texto: "Mensagem pronta a cada mudança de etapa, com protocolo, senha e link de acompanhamento.",
  },
  {
    icone: Car,
    titulo: "Histórico por placa",
    texto: "Todo serviço já feito no veículo, mesmo que ele tenha trocado de dono.",
  },
  {
    icone: ShieldCheck,
    titulo: "Perfis de acesso",
    texto: "Admin, financeiro, auditoria, atendente, técnico e recepção com permissões próprias.",
  },
  {
    icone: BarChart3,
    titulo: "Relatórios gerenciais",
    texto: "Faturamento, status, ranking de serviços e produtividade em gráficos.",
  },
];

function Index() {
  const { user, ehEquipe } = useAuth();

  return (
    <div className="surface-grid min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="font-display text-2xl">OficinaPro</span>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/portal">Sou cliente</Link>
          </Button>
          {user ? (
            <Button asChild>
              <Link to={ehEquipe ? "/painel" : "/auth"}>Abrir painel</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="py-16 text-center md:py-24">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Oficina mecânica · Martelinho de ouro · Estética automotiva
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-5xl leading-none md:text-7xl">
            Ordem de serviço aberta na voz, acompanhada pelo cliente
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Cadastro de clientes e veículos, orçamento, fotos de cada etapa, aviso automático no
            WhatsApp e relatórios gerenciais — tudo em um só lugar.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Começar agora <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/portal">Acompanhar minha OS</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {RECURSOS.map((r) => (
            <div key={r.titulo} className="panel p-6">
              <r.icone className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-2xl">{r.titulo}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{r.texto}</p>
            </div>
          ))}
        </section>

        <section className="panel mt-16 p-8 md:p-12">
          <h2 className="text-3xl">Exemplo de comando por voz</h2>
          <p className="mt-4 rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm text-muted-foreground">
            “Meu assistente, abrir uma ordem de serviço, cadastrar o cliente Jucemar De Giacometti no
            telefone 54996161740, colocar o serviço de martelinho de ouro no para-lama dianteiro
            esquerdo no valor de R$300,00 e pintura do para-choque traseiro no lado direito no valor
            de R$120,00. Enviar orçamento pelo WhatsApp.”
          </p>
        </section>
      </main>
    </div>
  );
}
