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
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          content_id: string
          content_type: string
          created_at: string
          creator_user_id: string
          id: string
          parent_comment_id: string | null
          updated_at: string
        }
        Insert: {
          content: string
          content_id: string
          content_type: string
          created_at?: string
          creator_user_id: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_id?: string
          content_type?: string
          created_at?: string
          creator_user_id?: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_creator_user_id"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_widgets: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          display_config: Json
          id: string
          is_active: boolean
          metrics: Json
          position: number
          section: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          display_config?: Json
          id?: string
          is_active?: boolean
          metrics?: Json
          position?: number
          section: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          display_config?: Json
          id?: string
          is_active?: boolean
          metrics?: Json
          position?: number
          section?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_needed: number
          amount_raised: number | null
          approval_decision_made: boolean
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          creator_user_id: string
          description: string | null
          donation_link: string | null
          id: string
          is_approved: boolean
          organization_id: string | null
          organization_name: string | null
          target_date: string | null
          title: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          amount_needed: number
          amount_raised?: number | null
          approval_decision_made?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          creator_user_id: string
          description?: string | null
          donation_link?: string | null
          id?: string
          is_approved?: boolean
          organization_id?: string | null
          organization_name?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          amount_needed?: number
          amount_raised?: number | null
          approval_decision_made?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          creator_user_id?: string
          description?: string | null
          donation_link?: string | null
          id?: string
          is_approved?: boolean
          organization_id?: string | null
          organization_name?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          guest_info: Json | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_info?: Json | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_info?: Json | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          approval_decision_made: boolean
          created_at: string
          creator_user_id: string
          description: string | null
          event_date: string
          id: string
          is_approved: boolean
          location: string | null
          max_participants: number | null
          title: string
          updated_at: string
        }
        Insert: {
          approval_decision_made?: boolean
          created_at?: string
          creator_user_id: string
          description?: string | null
          event_date: string
          id?: string
          is_approved?: boolean
          location?: string | null
          max_participants?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          approval_decision_made?: boolean
          created_at?: string
          creator_user_id?: string
          description?: string | null
          event_date?: string
          id?: string
          is_approved?: boolean
          location?: string | null
          max_participants?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          creator_user_id: string | null
          id: string
          is_read: boolean
          message: string
          related_content_id: string | null
          related_content_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creator_user_id?: string | null
          id?: string
          is_read?: boolean
          message: string
          related_content_id?: string | null
          related_content_type?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creator_user_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          related_content_id?: string | null
          related_content_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string
          approval_decision_made: boolean
          contact_user_id: string | null
          created_at: string
          description: string | null
          id: string
          is_approved: boolean
          name: string
          phone: string
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string
        }
        Insert: {
          address: string
          approval_decision_made?: boolean
          contact_user_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          name: string
          phone: string
          type: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Update: {
          address?: string
          approval_decision_made?: boolean
          contact_user_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          name?: string
          phone?: string
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_contact_user_id_fkey"
            columns: ["contact_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          approval_decision_made: boolean
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          creator_user_id: string
          deadline: string | null
          description: string | null
          id: string
          is_approved: boolean
          is_completed: boolean
          location: string | null
          organization_id: string | null
          organization_name: string | null
          request_type: string
          title: string
          updated_at: string
          urgency_level: string | null
        }
        Insert: {
          approval_decision_made?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          creator_user_id: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean
          is_completed?: boolean
          location?: string | null
          organization_id?: string | null
          organization_name?: string | null
          request_type: string
          title: string
          updated_at?: string
          urgency_level?: string | null
        }
        Update: {
          approval_decision_made?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          creator_user_id?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean
          is_completed?: boolean
          location?: string | null
          organization_id?: string | null
          organization_name?: string | null
          request_type?: string
          title?: string
          updated_at?: string
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: number
          application_deadline: string | null
          approval_decision_made: boolean
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          creator_user_id: string
          description: string | null
          eligibility_criteria: string | null
          id: string
          is_approved: boolean
          organization_id: string | null
          organization_name: string | null
          scholarship_link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          application_deadline?: string | null
          approval_decision_made?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          creator_user_id: string
          description?: string | null
          eligibility_criteria?: string | null
          id?: string
          is_approved?: boolean
          organization_id?: string | null
          organization_name?: string | null
          scholarship_link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          application_deadline?: string | null
          approval_decision_made?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          creator_user_id?: string
          description?: string | null
          eligibility_criteria?: string | null
          id?: string
          is_approved?: boolean
          organization_id?: string | null
          organization_name?: string | null
          scholarship_link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string
          approval_decision_made: boolean
          created_at: string
          email: string
          first_name: string
          id: string
          is_approved: boolean
          last_name: string
          organization_id: string | null
          phone: string
          role_id: string
          updated_at: string
        }
        Insert: {
          address: string
          approval_decision_made?: boolean
          created_at?: string
          email: string
          first_name: string
          id: string
          is_approved?: boolean
          last_name: string
          organization_id?: string | null
          phone: string
          role_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          approval_decision_made?: boolean
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_approved?: boolean
          last_name?: string
          organization_id?: string | null
          phone?: string
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          email_verification_token: string | null
          email_verified: boolean
          failed_login_attempts: number
          id: string
          locked_until: string | null
          password_hash: string
          password_reset_expires_at: string | null
          password_reset_token: string | null
          salt: string
          session_expires_at: string | null
          session_token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_verification_token?: string | null
          email_verified?: boolean
          failed_login_attempts?: number
          id?: string
          locked_until?: string | null
          password_hash: string
          password_reset_expires_at?: string | null
          password_reset_token?: string | null
          salt: string
          session_expires_at?: string | null
          session_token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_verification_token?: string | null
          email_verified?: boolean
          failed_login_attempts?: number
          id?: string
          locked_until?: string | null
          password_hash?: string
          password_reset_expires_at?: string | null
          password_reset_token?: string | null
          salt?: string
          session_expires_at?: string | null
          session_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_salt: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_session_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      hash_password: {
        Args: { password: string; salt: string }
        Returns: string
      }
      verify_password: {
        Args: { password: string; hash: string }
        Returns: boolean
      }
    }
    Enums: {
      organization_type:
        | "Non-Profit"
        | "Educational Institution"
        | "Community Group"
        | "Religious Organization"
        | "Sports Club"
        | "Professional Association"
        | "Other"
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
      organization_type: [
        "Non-Profit",
        "Educational Institution",
        "Community Group",
        "Religious Organization",
        "Sports Club",
        "Professional Association",
        "Other",
      ],
    },
  },
} as const
