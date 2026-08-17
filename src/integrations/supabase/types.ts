export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          cidade: string | null
          created_at: string
          created_by: string | null
          documento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          created_by?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          created_at?: string
          created_by?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          empresa_documento: string | null
          empresa_endereco: string | null
          empresa_nome: string
          empresa_telefone: string | null
          entrada_por_voz: boolean
          id: string
          ramo: string
          template_orcamento: string
          template_status: string
          updated_at: string
          whatsapp_ativo: boolean
        }
        Insert: {
          empresa_documento?: string | null
          empresa_endereco?: string | null
          empresa_nome?: string
          empresa_telefone?: string | null
          entrada_por_voz?: boolean
          id?: string
          ramo?: string
          template_orcamento?: string
          template_status?: string
          updated_at?: string
          whatsapp_ativo?: boolean
        }
        Update: {
          empresa_documento?: string | null
          empresa_endereco?: string | null
          empresa_nome?: string
          empresa_telefone?: string | null
          entrada_por_voz?: boolean
          id?: string
          ramo?: string
          template_orcamento?: string
          template_status?: string
          updated_at?: string
          whatsapp_ativo?: boolean
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          cliente_id: string | null
          created_at: string
          created_by: string | null
          desconto: number
          descricao: string | null
          forma_pagamento: string | null
          id: string
          km_entrada: number | null
          laudo: string | null
          numero: number
          observacoes: string | null
          pago: boolean
          previsao_entrega: string | null
          protocolo: string
          senha_acesso: string
          status: Database["public"]["Enums"]["os_status"]
          tipo_servico: string | null
          updated_at: string
          veiculo_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          desconto?: number
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          km_entrada?: number | null
          laudo?: string | null
          numero?: number
          observacoes?: string | null
          pago?: boolean
          previsao_entrega?: string | null
          protocolo: string
          senha_acesso: string
          status?: Database["public"]["Enums"]["os_status"]
          tipo_servico?: string | null
          updated_at?: string
          veiculo_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          desconto?: number
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          km_entrada?: number | null
          laudo?: string | null
          numero?: number
          observacoes?: string | null
          pago?: boolean
          previsao_entrega?: string | null
          protocolo?: string
          senha_acesso?: string
          status?: Database["public"]["Enums"]["os_status"]
          tipo_servico?: string | null
          updated_at?: string
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      os_fotos: {
        Row: {
          created_at: string
          created_by: string | null
          fase: Database["public"]["Enums"]["foto_fase"]
          id: string
          legenda: string | null
          os_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          fase?: Database["public"]["Enums"]["foto_fase"]
          id?: string
          legenda?: string | null
          os_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          fase?: Database["public"]["Enums"]["foto_fase"]
          id?: string
          legenda?: string | null
          os_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_fotos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      os_itens: {
        Row: {
          created_at: string
          descricao: string
          id: string
          local_peca: string | null
          os_id: string
          quantidade: number
          tipo: Database["public"]["Enums"]["item_tipo"]
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          local_peca?: string | null
          os_id: string
          quantidade?: number
          tipo?: Database["public"]["Enums"]["item_tipo"]
          valor_unitario?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          local_peca?: string | null
          os_id?: string
          quantidade?: number
          tipo?: Database["public"]["Enums"]["item_tipo"]
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "os_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      os_status_historico: {
        Row: {
          comentario: string | null
          created_at: string
          created_by: string | null
          id: string
          notificado_whatsapp: boolean
          os_id: string
          status: Database["public"]["Enums"]["os_status"]
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notificado_whatsapp?: boolean
          os_id: string
          status: Database["public"]["Enums"]["os_status"]
        }
        Update: {
          comentario?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notificado_whatsapp?: boolean
          os_id?: string
          status?: Database["public"]["Enums"]["os_status"]
        }
        Relationships: [
          {
            foreignKeyName: "os_status_historico_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: number | null
          chassi: string | null
          cliente_id: string | null
          cor: string | null
          created_at: string
          id: string
          km: number | null
          marca: string | null
          modelo: string | null
          observacoes: string | null
          placa: string
          updated_at: string
        }
        Insert: {
          ano?: number | null
          chassi?: string | null
          cliente_id?: string | null
          cor?: string | null
          created_at?: string
          id?: string
          km?: number | null
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa: string
          updated_at?: string
        }
        Update: {
          ano?: number | null
          chassi?: string | null
          cliente_id?: string | null
          cor?: string | null
          created_at?: string
          id?: string
          km?: number | null
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write: { Args: { _user_id: string }; Returns: boolean }
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      portal_consultar: {
        Args: { _protocolo: string; _senha: string }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "financeiro"
        | "auditoria"
        | "atendente"
        | "tecnico"
        | "recepcao"
      foto_fase: "antes" | "durante" | "depois"
      item_tipo: "servico" | "produto"
      os_status:
        | "orcamento"
        | "aprovado"
        | "em_execucao"
        | "aguardando_peca"
        | "pronto"
        | "entregue"
        | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "financeiro",
        "auditoria",
        "atendente",
        "tecnico",
        "recepcao",
      ],
      foto_fase: ["antes", "durante", "depois"],
      item_tipo: ["servico", "produto"],
      os_status: [
        "orcamento",
        "aprovado",
        "em_execucao",
        "aguardando_peca",
        "pronto",
        "entregue",
        "cancelado",
      ],
    },
  },
} as const
