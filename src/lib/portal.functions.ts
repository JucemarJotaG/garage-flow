import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  protocolo: z.string().min(3).max(40),
  senha: z.string().min(3).max(20),
});

export type PortalResultado = {
  erro?: string;
  os?: Record<string, unknown>;
  cliente?: { nome: string } | null;
  veiculo?: Record<string, unknown> | null;
  itens?: Array<Record<string, unknown>>;
  historico?: Array<Record<string, unknown>>;
  fotos?: Array<{ fase: string; storage_path: string; legenda: string | null; url?: string }>;
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

    const fotos = res.fotos ?? [];
    for (const foto of fotos) {
      const { data: signed } = await supabaseAdmin.storage
        .from("os-fotos")
        .createSignedUrl(foto.storage_path, 3600);
      foto.url = signed?.signedUrl;
    }

    return { ...res, fotos };
  });
