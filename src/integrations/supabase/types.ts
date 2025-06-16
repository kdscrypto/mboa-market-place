export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_images: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          image_url: string
          position: number
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          image_url: string
          position?: number
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          image_url?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_images_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_plans: {
        Row: {
          created_at: string
          description: string
          duration_days: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          duration_days: number
          id: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          ad_type: string
          category: string
          city: string
          created_at: string
          description: string
          id: string
          payment_id: string | null
          payment_transaction_id: string | null
          phone: string
          premium_expires_at: string | null
          price: number
          region: string
          reject_reason: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          ad_type?: string
          category: string
          city: string
          created_at?: string
          description: string
          id?: string
          payment_id?: string | null
          payment_transaction_id?: string | null
          phone: string
          premium_expires_at?: string | null
          price: number
          region: string
          reject_reason?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          ad_type?: string
          category?: string
          city?: string
          created_at?: string
          description?: string
          id?: string
          payment_id?: string | null
          payment_transaction_id?: string | null
          phone?: string
          premium_expires_at?: string | null
          price?: number
          region?: string
          reject_reason?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      affiliate_points: {
        Row: {
          created_at: string | null
          id: string
          level_1_referrals: number
          level_2_referrals: number
          points: number
          total_earned: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level_1_referrals?: number
          level_2_referrals?: number
          points?: number
          total_earned?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level_1_referrals?: number
          level_2_referrals?: number
          points?: number
          total_earned?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          action_type: string
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          identifier_type: string
          request_count: number
          updated_at: string | null
          window_start: string
        }
        Insert: {
          action_type: string
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          identifier_type: string
          request_count?: number
          updated_at?: string | null
          window_start?: string
        }
        Update: {
          action_type?: string
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number
          updated_at?: string | null
          window_start?: string
        }
        Relationships: []
      }
      auth_security_events: {
        Row: {
          auto_blocked: boolean | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          identifier: string
          identifier_type: string
          reviewed: boolean | null
          risk_score: number | null
          severity: string
        }
        Insert: {
          auto_blocked?: boolean | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          identifier: string
          identifier_type: string
          reviewed?: boolean | null
          risk_score?: number | null
          severity: string
        }
        Update: {
          auto_blocked?: boolean | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          identifier?: string
          identifier_type?: string
          reviewed?: boolean | null
          risk_score?: number | null
          severity?: string
        }
        Relationships: []
      }
      conversation_labels: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          label_color: string | null
          label_name: string
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          label_color?: string | null
          label_name: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          label_color?: string | null
          label_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_labels_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ad_id: string
          archived: boolean | null
          archived_at: string | null
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string
          pinned: boolean | null
          pinned_at: string | null
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          ad_id: string
          archived?: boolean | null
          archived_at?: string | null
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          pinned?: boolean | null
          pinned_at?: string | null
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          ad_id?: string
          archived?: boolean | null
          archived_at?: string | null
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          pinned?: boolean | null
          pinned_at?: string | null
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      lygos_configurations: {
        Row: {
          api_key: string
          api_secret: string | null
          base_url: string
          cancel_url: string | null
          created_at: string
          environment: string
          id: string
          is_active: boolean
          return_url: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key: string
          api_secret?: string | null
          base_url?: string
          cancel_url?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean
          return_url?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string
          api_secret?: string | null
          base_url?: string
          cancel_url?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean
          return_url?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      message_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          message_id: string | null
          reason: string
          reported_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          message_id?: string | null
          reason: string
          reported_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          message_id?: string | null
          reason?: string
          reported_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          delivered_at: string | null
          id: string
          message_type: string
          moderated: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_reason: string | null
          read: boolean
          read_at: string | null
          sender_id: string
          status: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          message_type?: string
          moderated?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          read?: boolean
          read_at?: string | null
          sender_id: string
          status?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          message_type?: string
          moderated?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          read?: boolean
          read_at?: string | null
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_audit_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          security_flags: Json | null
          transaction_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          security_flags?: Json | null
          transaction_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          security_flags?: Json | null
          transaction_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      payment_rate_limits: {
        Row: {
          action_type: string
          blocked_until: string | null
          created_at: string
          id: string
          identifier: string
          identifier_type: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          action_type: string
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          identifier_type: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          action_type?: string
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      payment_security_events: {
        Row: {
          auto_blocked: boolean | null
          created_at: string
          event_data: Json
          event_type: string
          id: string
          identifier: string
          identifier_type: string
          reviewed: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number | null
          severity: string
        }
        Insert: {
          auto_blocked?: boolean | null
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          identifier: string
          identifier_type: string
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          severity: string
        }
        Update: {
          auto_blocked?: boolean | null
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          identifier?: string
          identifier_type?: string
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          severity?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          ad_id: string | null
          amount: number
          callback_data: Json | null
          cancel_url: string | null
          client_fingerprint: string | null
          completed_at: string | null
          created_at: string
          currency: string
          data_encryption_key_id: string | null
          encrypted_payment_data: string | null
          expires_at: string
          external_reference: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          lygos_payment_id: string | null
          lygos_status: string | null
          lygos_transaction_id: string | null
          notify_url: string | null
          payment_data: Json | null
          payment_method: string
          payment_provider: string | null
          payment_url: string | null
          processing_lock: boolean | null
          return_url: string | null
          security_score: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_id?: string | null
          amount: number
          callback_data?: Json | null
          cancel_url?: string | null
          client_fingerprint?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          data_encryption_key_id?: string | null
          encrypted_payment_data?: string | null
          expires_at: string
          external_reference?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          lygos_payment_id?: string | null
          lygos_status?: string | null
          lygos_transaction_id?: string | null
          notify_url?: string | null
          payment_data?: Json | null
          payment_method?: string
          payment_provider?: string | null
          payment_url?: string | null
          processing_lock?: boolean | null
          return_url?: string | null
          security_score?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_id?: string | null
          amount?: number
          callback_data?: Json | null
          cancel_url?: string | null
          client_fingerprint?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          data_encryption_key_id?: string | null
          encrypted_payment_data?: string | null
          expires_at?: string
          external_reference?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          lygos_payment_id?: string | null
          lygos_status?: string | null
          lygos_transaction_id?: string | null
          notify_url?: string | null
          payment_data?: Json | null
          payment_method?: string
          payment_provider?: string | null
          payment_url?: string | null
          processing_lock?: boolean | null
          return_url?: string | null
          security_score?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          ad_id: string | null
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_url: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_id?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_url?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_id?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_url?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "ad_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          affiliate_code: string
          created_at: string | null
          id: string
          level: number
          referred_id: string
          referrer_id: string
        }
        Insert: {
          affiliate_code: string
          created_at?: string | null
          id?: string
          level?: number
          referred_id: string
          referrer_id: string
        }
        Update: {
          affiliate_code?: string
          created_at?: string | null
          id?: string
          level?: number
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      system_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          message_type: string
          metadata: Json | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "system_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_transaction_lock: {
        Args: { transaction_uuid: string; lock_identifier: string }
        Returns: boolean
      }
      calculate_premium_expiration: {
        Args: { plan_id: string; created_at: string }
        Returns: string
      }
      check_auth_rate_limit: {
        Args: {
          p_identifier: string
          p_identifier_type: string
          p_action_type: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_identifier_type: string
          p_action_type: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      cleanup_expired_lygos_transactions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_transactions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_payment_system: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_lygos_transaction: {
        Args: {
          p_user_id: string
          p_ad_id: string
          p_amount: number
          p_currency?: string
          p_description?: string
          p_external_reference?: string
        }
        Returns: string
      }
      create_system_message: {
        Args: {
          conversation_uuid: string
          msg_type: string
          msg_content: string
          msg_metadata?: Json
        }
        Returns: string
      }
      detect_suspicious_activity: {
        Args: {
          p_identifier: string
          p_identifier_type: string
          p_event_data: Json
        }
        Returns: Json
      }
      detect_suspicious_auth_activity: {
        Args: {
          p_identifier: string
          p_identifier_type: string
          p_event_data: Json
        }
        Returns: Json
      }
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_lygos_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_affiliate_stats: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_monetbil_migration_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_or_moderator: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_messages_as_delivered: {
        Args: { conversation_uuid: string }
        Returns: undefined
      }
      process_referral: {
        Args: { referred_user_id: string; affiliate_code_param: string }
        Returns: undefined
      }
      release_transaction_lock: {
        Args: { transaction_uuid: string; lock_identifier: string }
        Returns: boolean
      }
      update_lygos_transaction_status: {
        Args: {
          p_lygos_payment_id: string
          p_status: string
          p_lygos_data?: Json
          p_completed_at?: string
        }
        Returns: boolean
      }
      validate_affiliate_code: {
        Args: { code_param: string }
        Returns: Json
      }
      validate_image_extension: {
        Args: { filename: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "admin", "moderator"],
    },
  },
} as const
