import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  protocolo: z.string().min(3).max(40),
  senha: z.string().min(3).max(20),
});

export type PortalFoto = {
  fase: string;
  storage_path: string;
  legenda: string | null;
  url?: string | undefined;
};

export type PortalResultado = {
  erro?: string | undefined;
  os?:
    | {
        numero: number;
        protocolo: string;
        status: string;
        descricao: string | null;
        laudo: string | null;
        previsao_entrega: string | null;
        desconto: string | number | null;
        created_at: string;
        tipo_servico: string | null;
      }
    | undefined;
  cliente?: { nome: string } | null | undefined;
  veiculo?:
    | {
        placa: string;
        marca: string | null;
        modelo: string | null;
        cor: string | null;
        ano: number | null;
      }
    | null
    | undefined;
  itens?:
    | Array<{
        tipo: string;
        descricao: string;
        local_peca: string | null;
        quantidade: string | number;
        valor_unitario: string | number;
      }>
    | undefined;
  historico?:
    | Array<{ status: string; comentario: string | null; created_at: string }>
    | undefined;
  fotos?: PortalFoto[] | undefined;
};

export const consultarPortal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<PortalResultado> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: resultado, error } = await supabaseAdmin.rpc("portal_consultar", {
      _protocolo: data.protocolo,
      _senha: data.senha,
    });

    if (error) {
      console.error("portal_consultar", error.message);
      return { erro: "Não foi possível consultar agora. Tente novamente." };
    }

    const res = (resultado ?? {}) as PortalResultado;
    if (res.erro) return { erro: res.erro };

    const fotos: PortalFoto[] = res.fotos ?? [];
    const comUrl: PortalFoto[] = [];
    for (const foto of fotos) {
      const { data: signed } = await supabaseAdmin.storage
        .from("os-fotos")
        .createSignedUrl(foto.storage_path, 3600);
      comUrl.push({ ...foto, url: signed?.signedUrl ?? undefined });
    }

    return { ...res, fotos: comUrl };
  });
