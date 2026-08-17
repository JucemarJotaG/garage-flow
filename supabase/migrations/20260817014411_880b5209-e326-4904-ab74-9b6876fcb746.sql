
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.app_role AS ENUM ('admin','financeiro','auditoria','atendente','tecnico','recepcao');
CREATE TYPE public.os_status AS ENUM ('orcamento','aprovado','em_execucao','aguardando_peca','pronto','entregue','cancelado');
CREATE TYPE public.foto_fase AS ENUM ('antes','durante','depois');
CREATE TYPE public.item_tipo AS ENUM ('servico','produto');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT,
  telefone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.can_write(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','atendente','tecnico','recepcao','financeiro')
  );
$$;

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inserted BOOLEAN := false;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (auth.uid(),'admin');
    inserted := true;
  END IF;
  RETURN inserted;
END; $$;

CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_admin_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_admin_update" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  documento TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes_select" ON public.clientes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "clientes_insert" ON public.clientes FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "clientes_update" ON public.clientes FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "clientes_delete" ON public.clientes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,
  marca TEXT,
  modelo TEXT,
  cor TEXT,
  ano INTEGER,
  km INTEGER,
  chassi TEXT,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.veiculos TO authenticated;
GRANT ALL ON public.veiculos TO service_role;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "veiculos_select" ON public.veiculos FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "veiculos_insert" ON public.veiculos FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "veiculos_update" ON public.veiculos FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "veiculos_delete" ON public.veiculos FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE SEQUENCE public.os_numero_seq START 1000;

CREATE TABLE public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGINT NOT NULL DEFAULT nextval('public.os_numero_seq') UNIQUE,
  protocolo TEXT NOT NULL UNIQUE,
  senha_acesso TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE SET NULL,
  status public.os_status NOT NULL DEFAULT 'orcamento',
  tipo_servico TEXT,
  km_entrada INTEGER,
  previsao_entrega DATE,
  descricao TEXT,
  laudo TEXT,
  observacoes TEXT,
  desconto NUMERIC(12,2) NOT NULL DEFAULT 0,
  forma_pagamento TEXT,
  pago BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordens_servico TO authenticated;
GRANT ALL ON public.ordens_servico TO service_role;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_select" ON public.ordens_servico FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "os_insert" ON public.ordens_servico FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "os_update" ON public.ordens_servico FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "os_delete" ON public.ordens_servico FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.os_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  tipo public.item_tipo NOT NULL DEFAULT 'servico',
  descricao TEXT NOT NULL,
  local_peca TEXT,
  quantidade NUMERIC(12,2) NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.os_itens TO authenticated;
GRANT ALL ON public.os_itens TO service_role;
ALTER TABLE public.os_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "itens_select" ON public.os_itens FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "itens_insert" ON public.os_itens FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "itens_update" ON public.os_itens FOR UPDATE TO authenticated USING (public.can_write(auth.uid()));
CREATE POLICY "itens_delete" ON public.os_itens FOR DELETE TO authenticated USING (public.can_write(auth.uid()));

CREATE TABLE public.os_status_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  status public.os_status NOT NULL,
  comentario TEXT,
  notificado_whatsapp BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.os_status_historico TO authenticated;
GRANT ALL ON public.os_status_historico TO service_role;
ALTER TABLE public.os_status_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hist_select" ON public.os_status_historico FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "hist_insert" ON public.os_status_historico FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));

CREATE TABLE public.os_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  fase public.foto_fase NOT NULL DEFAULT 'antes',
  storage_path TEXT NOT NULL,
  legenda TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.os_fotos TO authenticated;
GRANT ALL ON public.os_fotos TO service_role;
ALTER TABLE public.os_fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fotos_select" ON public.os_fotos FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "fotos_insert" ON public.os_fotos FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "fotos_delete" ON public.os_fotos FOR DELETE TO authenticated USING (public.can_write(auth.uid()));

CREATE TABLE public.configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_nome TEXT NOT NULL DEFAULT 'Minha Oficina',
  empresa_telefone TEXT,
  empresa_endereco TEXT,
  empresa_documento TEXT,
  ramo TEXT NOT NULL DEFAULT 'oficina',
  entrada_por_voz BOOLEAN NOT NULL DEFAULT true,
  whatsapp_ativo BOOLEAN NOT NULL DEFAULT true,
  template_status TEXT NOT NULL DEFAULT 'Olá {cliente}! Sua OS {numero} ({veiculo}) mudou para: {status}. Acompanhe em {link} | Protocolo: {protocolo} | Senha: {senha}',
  template_orcamento TEXT NOT NULL DEFAULT 'Olá {cliente}, segue o orçamento da OS {numero} - {veiculo}:{itens}
Total: {total}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_select" ON public.configuracoes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "config_insert" ON public.configuracoes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "config_update" ON public.configuracoes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.configuracoes (empresa_nome) VALUES ('Minha Oficina');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER t_clientes_upd BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_veiculos_upd BEFORE UPDATE ON public.veiculos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_os_upd BEFORE UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.log_os_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.os_status_historico(os_id, status, created_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER t_os_status AFTER INSERT OR UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.log_os_status();

CREATE OR REPLACE FUNCTION public.portal_consultar(_protocolo TEXT, _senha TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE os RECORD; resultado JSONB;
BEGIN
  SELECT * INTO os FROM public.ordens_servico
   WHERE upper(protocolo) = upper(trim(_protocolo)) AND senha_acesso = trim(_senha);
  IF NOT FOUND THEN RETURN jsonb_build_object('erro','Protocolo ou senha inválidos'); END IF;

  SELECT jsonb_build_object(
    'os', jsonb_build_object(
      'numero', os.numero, 'protocolo', os.protocolo, 'status', os.status,
      'descricao', os.descricao, 'laudo', os.laudo, 'previsao_entrega', os.previsao_entrega,
      'desconto', os.desconto, 'created_at', os.created_at, 'tipo_servico', os.tipo_servico),
    'cliente', (SELECT jsonb_build_object('nome', c.nome) FROM public.clientes c WHERE c.id = os.cliente_id),
    'veiculo', (SELECT jsonb_build_object('placa', v.placa,'marca', v.marca,'modelo', v.modelo,'cor', v.cor,'ano', v.ano)
                FROM public.veiculos v WHERE v.id = os.veiculo_id),
    'itens', COALESCE((SELECT jsonb_agg(jsonb_build_object('tipo', i.tipo,'descricao', i.descricao,'local_peca', i.local_peca,'quantidade', i.quantidade,'valor_unitario', i.valor_unitario) ORDER BY i.created_at)
                FROM public.os_itens i WHERE i.os_id = os.id), '[]'::jsonb),
    'historico', COALESCE((SELECT jsonb_agg(jsonb_build_object('status', h.status,'comentario', h.comentario,'created_at', h.created_at) ORDER BY h.created_at)
                FROM public.os_status_historico h WHERE h.os_id = os.id), '[]'::jsonb),
    'fotos', COALESCE((SELECT jsonb_agg(jsonb_build_object('fase', f.fase,'storage_path', f.storage_path,'legenda', f.legenda) ORDER BY f.created_at)
                FROM public.os_fotos f WHERE f.os_id = os.id), '[]'::jsonb)
  ) INTO resultado;
  RETURN resultado;
END; $$;
REVOKE ALL ON FUNCTION public.portal_consultar(TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_consultar(TEXT,TEXT) TO service_role;

CREATE POLICY "fotos_staff_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'os-fotos' AND public.is_staff(auth.uid()));
CREATE POLICY "fotos_staff_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'os-fotos' AND public.can_write(auth.uid()));
CREATE POLICY "fotos_staff_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'os-fotos' AND public.can_write(auth.uid()));

CREATE INDEX idx_os_veiculo ON public.ordens_servico(veiculo_id);
CREATE INDEX idx_os_cliente ON public.ordens_servico(cliente_id);
CREATE INDEX idx_itens_os ON public.os_itens(os_id);
CREATE INDEX idx_fotos_os ON public.os_fotos(os_id);
