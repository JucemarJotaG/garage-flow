import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const schema = z.object({
  texto: z.string().min(3).max(4000),
  ramo: z.string().max(40).optional(),
});

export type ComandoInterpretado = {
  cliente?: { nome?: string; telefone?: string; documento?: string; email?: string };
  veiculo?: { placa?: string; marca?: string; modelo?: string; cor?: string; ano?: number };
  ordem?: { descricao?: string; tipo_servico?: string; observacoes?: string; status?: string };
  itens?: Array<{
    tipo: "servico" | "produto";
    descricao: string;
    local_peca?: string;
    quantidade?: number;
    valor_unitario?: number;
  }>;
  acoes?: string[];
  resumo?: string;
  erro?: string;
};

const PROMPT = `Você é o assistente de uma empresa do ramo automotivo (oficina mecânica, martelinho de ouro, estética automotiva, funilaria).
Recebe um comando falado ou digitado em português do Brasil e extrai os dados estruturados para abrir uma Ordem de Serviço.
Regras:
- Valores em reais viram número (ex.: "R$ 300,00" -> 300).
- "quantidade" padrão 1.
- "local_peca" recebe a parte do veículo (ex.: "para-lama dianteiro esquerdo").
- tipo = "produto" quando for peça/material comprado, senão "servico".
- Placas devem vir sem espaços e em maiúsculo.
- "acoes" pode conter: "enviar_orcamento_whatsapp", "enviar_status_whatsapp", "tirar_fotos".
- Responda SOMENTE com JSON válido, sem markdown.
Formato:
{"cliente":{"nome":"","telefone":""},"veiculo":{"placa":"","marca":"","modelo":"","cor":""},"ordem":{"descricao":"","tipo_servico":""},"itens":[{"tipo":"servico","descricao":"","local_peca":"","quantidade":1,"valor_unitario":0}],"acoes":[],"resumo":""}`;

export const interpretarComando = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<ComandoInterpretado> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { erro: "Assistente de voz indisponível: chave de IA não configurada." };

    const resposta = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: `${PROMPT}\nRamo da empresa: ${data.ramo ?? "oficina"}.` },
          { role: "user", content: data.texto },
        ],
      }),
    });

    if (resposta.status === 429) return { erro: "Muitas solicitações. Aguarde alguns instantes." };
    if (resposta.status === 402) return { erro: "Créditos de IA esgotados no workspace." };
    if (!resposta.ok) {
      console.error("AI gateway", resposta.status, await resposta.text());
      return { erro: "Não consegui interpretar o comando agora." };
    }

    const json = (await resposta.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const conteudo = json.choices?.[0]?.message?.content ?? "";
    const limpo = conteudo
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(limpo) as ComandoInterpretado;
    } catch {
      const inicio = limpo.indexOf("{");
      const fim = limpo.lastIndexOf("}");
      if (inicio >= 0 && fim > inicio) {
        try {
          return JSON.parse(limpo.slice(inicio, fim + 1)) as ComandoInterpretado;
        } catch {
          /* ignora */
        }
      }
      return { erro: "Não entendi o comando. Tente novamente com mais detalhes." };
    }
  });
