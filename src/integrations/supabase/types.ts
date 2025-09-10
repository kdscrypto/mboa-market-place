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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      ad_ratings: {
        Row: {
          ad_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ad_reports: {
        Row: {
          ad_id: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_by: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          ad_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_by?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          ad_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_by?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_reports_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
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
      auth_webhook_config: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          webhook_type: string
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          webhook_type: string
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          webhook_type?: string
          webhook_url?: string
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
      input_validation_logs: {
        Row: {
          created_at: string
          id: string
          input_field: string
          input_value_hash: string | null
          ip_address: unknown | null
          severity: string
          threat_indicators: Json | null
          user_agent: string | null
          user_id: string | null
          validation_result: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_field: string
          input_value_hash?: string | null
          ip_address?: unknown | null
          severity?: string
          threat_indicators?: Json | null
          user_agent?: string | null
          user_id?: string | null
          validation_result: string
        }
        Update: {
          created_at?: string
          id?: string
          input_field?: string
          input_value_hash?: string | null
          ip_address?: unknown | null
          severity?: string
          threat_indicators?: Json | null
          user_agent?: string | null
          user_id?: string | null
          validation_result?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          failure_reason: string | null
          geolocation: Json | null
          id: string
          ip_address: unknown | null
          session_fingerprint: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          failure_reason?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown | null
          session_fingerprint?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          failure_reason?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown | null
          session_fingerprint?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
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
      password_security_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          old_password_hash: string | null
          security_score: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          old_password_hash?: string | null
          security_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          old_password_hash?: string | null
          security_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      security_alerts: {
        Row: {
          affected_user_id: string | null
          alert_type: string
          created_at: string
          description: string | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          risk_score: number
          severity: string
          source_identifier: string
          source_type: string
          status: string
          threat_data: Json
          title: string
          updated_at: string
        }
        Insert: {
          affected_user_id?: string | null
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number
          severity: string
          source_identifier: string
          source_type: string
          status?: string
          threat_data?: Json
          title: string
          updated_at?: string
        }
        Update: {
          affected_user_id?: string | null
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number
          severity?: string
          source_identifier?: string
          source_type?: string
          status?: string
          threat_data?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_metrics: {
        Row: {
          created_at: string
          id: string
          labels: Json
          metric_name: string
          metric_type: string
          time_bucket: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          labels?: Json
          metric_name: string
          metric_type: string
          time_bucket: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          labels?: Json
          metric_name?: string
          metric_type?: string
          time_bucket?: string
          value?: number
        }
        Relationships: []
      }
      security_performance_logs: {
        Row: {
          created_at: string
          error_details: string | null
          execution_time_ms: number
          function_name: string
          id: string
          parameters: Json | null
          result_summary: Json | null
        }
        Insert: {
          created_at?: string
          error_details?: string | null
          execution_time_ms: number
          function_name: string
          id?: string
          parameters?: Json | null
          result_summary?: Json | null
        }
        Update: {
          created_at?: string
          error_details?: string | null
          execution_time_ms?: number
          function_name?: string
          id?: string
          parameters?: Json | null
          result_summary?: Json | null
        }
        Relationships: []
      }
      security_threat_patterns: {
        Row: {
          auto_block_threshold: number
          created_at: string
          id: string
          is_active: boolean
          pattern_name: string
          pattern_type: string
          risk_weight: number
          threat_indicators: Json
          updated_at: string
        }
        Insert: {
          auto_block_threshold?: number
          created_at?: string
          id?: string
          is_active?: boolean
          pattern_name: string
          pattern_type: string
          risk_weight?: number
          threat_indicators?: Json
          updated_at?: string
        }
        Update: {
          auto_block_threshold?: number
          created_at?: string
          id?: string
          is_active?: boolean
          pattern_name?: string
          pattern_type?: string
          risk_weight?: number
          threat_indicators?: Json
          updated_at?: string
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
      user_role_changes: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          new_role: string
          old_role: string
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_role: string
          old_role: string
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_role?: string
          old_role?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          expires_at: string | null
          geolocation: Json | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          security_flags: Json | null
          session_token_hash: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          security_flags?: Json | null
          session_token_hash: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          security_flags?: Json | null
          session_token_hash?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_transaction_lock: {
        Args: { lock_identifier: string; transaction_uuid: string }
        Returns: boolean
      }
      calculate_premium_expiration: {
        Args: { created_at: string; plan_id: string }
        Returns: string
      }
      can_view_contact_info: {
        Args: { p_ad_id: string; p_user_id: string }
        Returns: boolean
      }
      check_auth_rate_limit: {
        Args: {
          p_action_type: string
          p_identifier: string
          p_identifier_type: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_identifier: string
          p_identifier_type: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      check_rls_health: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_user_permissions: {
        Args: { required_role?: string }
        Returns: boolean
      }
      clean_image_url: {
        Args: { url_input: string }
        Returns: string
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
      cleanup_security_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      collect_security_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_lygos_transaction: {
        Args: {
          p_ad_id: string
          p_amount: number
          p_currency?: string
          p_description?: string
          p_external_reference?: string
          p_user_id: string
        }
        Returns: string
      }
      create_system_message: {
        Args: {
          conversation_uuid: string
          msg_content: string
          msg_metadata?: Json
          msg_type: string
        }
        Returns: string
      }
      create_user_session: {
        Args: {
          p_device_fingerprint?: string
          p_expires_at?: string
          p_ip_address?: unknown
          p_session_token_hash: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      detect_advanced_threats: {
        Args: {
          p_context?: Json
          p_event_data: Json
          p_identifier: string
          p_identifier_type: string
        }
        Returns: Json
      }
      detect_suspicious_activity: {
        Args: {
          p_event_data: Json
          p_identifier: string
          p_identifier_type: string
        }
        Returns: Json
      }
      detect_suspicious_auth_activity: {
        Args: {
          p_event_data: Json
          p_identifier: string
          p_identifier_type: string
        }
        Returns: Json
      }
      detect_suspicious_login_patterns: {
        Args: { p_email: string; p_ip_address?: unknown }
        Returns: Json
      }
      diagnose_rls_system: {
        Args: Record<PropertyKey, never>
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
      get_ad_details_secure: {
        Args: { p_ad_id: string }
        Returns: {
          ad_type: string
          can_view_contact: boolean
          category: string
          city: string
          created_at: string
          description: string
          id: string
          phone: string
          premium_expires_at: string
          price: number
          region: string
          status: string
          title: string
          updated_at: string
          user_id: string
          whatsapp: string
        }[]
      }
      get_ad_primary_image: {
        Args: { p_ad_id: string }
        Returns: string
      }
      get_ad_reports_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          pending_reports: number
          resolved_reports: number
          top_reasons: Json
          total_reports: number
        }[]
      }
      get_affiliate_stats: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_homepage_ads: {
        Args: { p_limit?: number }
        Returns: {
          ad_type: string
          category: string
          city: string
          created_at: string
          description: string
          id: string
          is_premium: boolean
          premium_expires_at: string
          price: number
          region: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_lygos_client_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_monetbil_migration_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_public_ad_safe: {
        Args: { p_ad_id: string }
        Returns: {
          ad_type: string
          category: string
          city: string
          created_at: string
          description: string
          id: string
          is_premium: boolean
          premium_expires_at: string
          price: number
          region: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }[]
      }
      get_public_ads: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          ad_type: string
          category: string
          city: string
          created_at: string
          description: string
          id: string
          premium_expires_at: string
          price: number
          region: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_public_ads_safe: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          ad_type: string
          category: string
          city: string
          created_at: string
          description: string
          id: string
          is_premium: boolean
          premium_expires_at: string
          price: number
          region: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_public_ads_secure: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          ad_type: string
          category: string
          city: string
          created_at: string
          description: string
          id: string
          premium_expires_at: string
          price: number
          region: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_role_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          role: string
        }[]
      }
      get_user_role_history: {
        Args: { target_user_id: string }
        Returns: {
          changed_by: string
          created_at: string
          id: string
          metadata: Json
          new_role: string
          old_role: string
          reason: string
        }[]
      }
      get_user_role_safe: {
        Args: { user_uuid?: string }
        Returns: string
      }
      get_visible_ads: {
        Args: Record<PropertyKey, never>
        Returns: {
          ad_type: string
          category: string
          city: string
          created_at: string
          description: string
          id: string
          is_premium: boolean
          premium_expires_at: string
          price: number
          region: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_or_mod: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_auth_security_event_secure: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_identifier: string
          p_identifier_type: string
          p_severity: string
        }
        Returns: string
      }
      log_input_validation: {
        Args: {
          p_input_field: string
          p_input_value_hash: string
          p_ip_address?: unknown
          p_severity?: string
          p_threat_indicators?: Json
          p_user_agent?: string
          p_user_id: string
          p_validation_result: string
        }
        Returns: string
      }
      log_login_attempt: {
        Args: {
          p_email: string
          p_failure_reason?: string
          p_ip_address?: unknown
          p_session_fingerprint?: string
          p_success: boolean
          p_user_agent?: string
        }
        Returns: string
      }
      log_password_security_event: {
        Args: {
          p_event_type: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_security_score?: number
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      mark_message_read_secure: {
        Args: { p_message_id: string }
        Returns: boolean
      }
      mark_messages_as_delivered: {
        Args: { conversation_uuid: string }
        Returns: undefined
      }
      process_referral: {
        Args: { affiliate_code_param: string; referred_user_id: string }
        Returns: undefined
      }
      release_transaction_lock: {
        Args: { lock_identifier: string; transaction_uuid: string }
        Returns: boolean
      }
      resolve_security_alert: {
        Args: {
          p_alert_id: string
          p_resolution_notes?: string
          p_status: string
        }
        Returns: boolean
      }
      search_users_paginated: {
        Args: { page_offset?: number; page_size?: number; search_term?: string }
        Returns: {
          created_at: string
          email: string
          id: string
          role: string
          total_count: number
          username: string
        }[]
      }
      update_lygos_transaction_status: {
        Args: {
          p_completed_at?: string
          p_lygos_data?: Json
          p_lygos_payment_id: string
          p_status: string
        }
        Returns: boolean
      }
      update_transaction_status_secure: {
        Args: {
          p_callback_data?: Json
          p_lygos_status?: string
          p_new_status: string
          p_transaction_id: string
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
      validate_input_security: {
        Args: { p_input_type?: string; p_input_value: string }
        Returns: Json
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
      user_role: ["user", "admin", "moderator"],
    },
  },
} as const
