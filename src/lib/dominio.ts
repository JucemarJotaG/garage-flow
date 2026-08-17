export type OsStatus =
  | "orcamento"
  | "aprovado"
  | "em_execucao"
  | "aguardando_peca"
  | "pronto"
  | "entregue"
  | "cancelado";

export const STATUS_LABEL: Record<OsStatus, string> = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  em_execucao: "Em execução",
  aguardando_peca: "Aguardando peça",
  pronto: "Pronto para retirada",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const STATUS_LISTA: OsStatus[] = [
  "orcamento",
  "aprovado",
  "em_execucao",
  "aguardando_peca",
  "pronto",
  "entregue",
  "cancelado",
];

export const STATUS_TOM: Record<OsStatus, string> = {
  orcamento: "bg-muted text-muted-foreground",
  aprovado: "bg-info/15 text-info",
  em_execucao: "bg-primary/15 text-primary",
  aguardando_peca: "bg-warning/15 text-warning",
  pronto: "bg-success/15 text-success",
  entregue: "bg-success/25 text-success",
  cancelado: "bg-destructive/15 text-destructive",
};

export const FASES = ["antes", "durante", "depois"] as const;
export type Fase = (typeof FASES)[number];
export const FASE_LABEL: Record<Fase, string> = {
  antes: "Antes",
  durante: "Durante",
  depois: "Depois",
};

export const RAMOS = [
  { valor: "oficina", nome: "Oficina Mecânica" },
  { valor: "martelinho", nome: "Martelinho de Ouro" },
  { valor: "estetica", nome: "Estética Automotiva" },
  { valor: "funilaria", nome: "Funilaria e Pintura" },
  { valor: "outro", nome: "Outro" },
];

export const PERFIS = [
  { valor: "admin", nome: "Administrador", desc: "Acesso total, gerencia usuários" },
  { valor: "financeiro", nome: "Financeiro", desc: "Valores, pagamentos e relatórios" },
  { valor: "auditoria", nome: "Auditoria", desc: "Somente leitura de tudo" },
  { valor: "atendente", nome: "Atendente", desc: "Abre OS e cadastra clientes" },
  { valor: "tecnico", nome: "Técnico", desc: "Executa e atualiza status/fotos" },
  { valor: "recepcao", nome: "Recepção", desc: "Cadastros e acompanhamento" },
] as const;

export type Perfil = (typeof PERFIS)[number]["valor"];

export function moeda(valor: number | string | null | undefined) {
  const n = Number(valor ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function dataBR(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function dataHoraBR(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function normalizaPlaca(placa: string) {
  return placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function soDigitos(tel: string) {
  return (tel || "").replace(/\D/g, "");
}

/** Monta o número internacional (Brasil) para links do WhatsApp. */
export function telefoneWhats(tel: string) {
  const d = soDigitos(tel);
  if (!d) return "";
  if (d.startsWith("55")) return d;
  return `55${d}`;
}

export function linkWhatsApp(telefone: string, mensagem: string) {
  return `https://wa.me/${telefoneWhats(telefone)}?text=${encodeURIComponent(mensagem)}`;
}

export function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `OS${ano}-${rand}`;
}

export function gerarSenha() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export type ItemOS = {
  tipo: "servico" | "produto";
  descricao: string;
  local_peca?: string | null;
  quantidade: number | string;
  valor_unitario: number | string;
};

export function totalItens(itens: ItemOS[] | null | undefined) {
  return (itens ?? []).reduce(
    (acc, i) => acc + Number(i.quantidade || 0) * Number(i.valor_unitario || 0),
    0,
  );
}

export function preencherTemplate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (txt, [chave, valor]) => txt.replaceAll(`{${chave}}`, valor),
    template,
  );
}
