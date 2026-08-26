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
      advisory_board: {
        Row: {
          description: string
          id: string
          person_name: string
          photo_url: string
          role: string
          sort: number
        }
        Insert: {
          description?: string
          id?: string
          person_name?: string
          photo_url?: string
          role?: string
          sort?: number
        }
        Update: {
          description?: string
          id?: string
          person_name?: string
          photo_url?: string
          role?: string
          sort?: number
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor: string
          created_at: string
          id: string
        }
        Insert: {
          action?: string
          actor?: string
          created_at?: string
          id?: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          about: string
          activities: string[]
          cls: string
          head: string
          id: string
          member_count: number
          name: string
          name_th: string
          slug: string
          sort: number
          tagline: string
          updated_at: string
        }
        Insert: {
          about?: string
          activities?: string[]
          cls?: string
          head?: string
          id?: string
          member_count?: number
          name?: string
          name_th?: string
          slug: string
          sort?: number
          tagline?: string
          updated_at?: string
        }
        Update: {
          about?: string
          activities?: string[]
          cls?: string
          head?: string
          id?: string
          member_count?: number
          name?: string
          name_th?: string
          slug?: string
          sort?: number
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          admin_note: string
          anonymous: boolean
          cat: string
          contact: string
          created_at: string
          detail: string
          id: string
          klass: string
          reporter: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_note?: string
          anonymous?: boolean
          cat?: string
          contact?: string
          created_at?: string
          detail?: string
          id?: string
          klass?: string
          reporter?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string
          anonymous?: boolean
          cat?: string
          contact?: string
          created_at?: string
          detail?: string
          id?: string
          klass?: string
          reporter?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      congress_board: {
        Row: {
          from_org: string
          id: string
          klass: string
          person_name: string
          photo_url: string
          role: string
          sort: number
        }
        Insert: {
          from_org?: string
          id?: string
          klass?: string
          person_name?: string
          photo_url?: string
          role?: string
          sort?: number
        }
        Update: {
          from_org?: string
          id?: string
          klass?: string
          person_name?: string
          photo_url?: string
          role?: string
          sort?: number
        }
        Relationships: []
      }
      honors: {
        Row: {
          character_house: string
          house_of_month: string
          id: string
          month: string
        }
        Insert: {
          character_house?: string
          house_of_month?: string
          id?: string
          month: string
        }
        Update: {
          character_house?: string
          house_of_month?: string
          id?: string
          month?: string
        }
        Relationships: []
      }
      house_scores: {
        Row: {
          house_slug: string
          id: string
          month: string
          score: number
          updated_at: string
        }
        Insert: {
          house_slug: string
          id?: string
          month: string
          score?: number
          updated_at?: string
        }
        Update: {
          house_slug?: string
          id?: string
          month?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "house_scores_house_slug_fkey"
            columns: ["house_slug"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["slug"]
          },
        ]
      }
      houses: {
        Row: {
          captain: string
          captain_role: string
          cls: string
          color_label: string
          created_at: string
          id: string
          intro: string
          name: string
          name_th: string
          no: string
          personality: string
          slug: string
          sort: number
          updated_at: string
        }
        Insert: {
          captain?: string
          captain_role?: string
          cls?: string
          color_label?: string
          created_at?: string
          id?: string
          intro?: string
          name?: string
          name_th?: string
          no?: string
          personality?: string
          slug: string
          sort?: number
          updated_at?: string
        }
        Update: {
          captain?: string
          captain_role?: string
          cls?: string
          color_label?: string
          created_at?: string
          id?: string
          intro?: string
          name?: string
          name_th?: string
          no?: string
          personality?: string
          slug?: string
          sort?: number
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          created_at: string
          duties: string
          id: string
          klass: string
          name: string
          org: string
          org_label: string
          photo_url: string
          role: string
          sort: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duties?: string
          id?: string
          klass?: string
          name?: string
          org?: string
          org_label?: string
          photo_url?: string
          role?: string
          sort?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duties?: string
          id?: string
          klass?: string
          name?: string
          org?: string
          org_label?: string
          photo_url?: string
          role?: string
          sort?: number
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          body: string[]
          cat: string
          cover_url: string
          created_at: string
          date_label: string
          house_slug: string
          id: string
          intro: string
          published: boolean
          related: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string[]
          cat?: string
          cover_url?: string
          created_at?: string
          date_label?: string
          house_slug?: string
          id?: string
          intro?: string
          published?: boolean
          related?: string
          slug: string
          title?: string
          updated_at?: string
        }
        Update: {
          body?: string[]
          cat?: string
          cover_url?: string
          created_at?: string
          date_label?: string
          house_slug?: string
          id?: string
          intro?: string
          published?: boolean
          related?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      radio_bookings: {
        Row: {
          additional_info: string
          created_at: string
          id: string
          legacy_day: string
          legacy_slot: string
          klass: string
          message: string
          requester: string
          slot_id: string | null
          song: string
          student_id: string
          status: string
          updated_at: string
        }
        Insert: {
          additional_info?: string
          created_at?: string
          id?: string
          legacy_day?: string
          legacy_slot?: string
          klass?: string
          message?: string
          requester?: string
          slot_id?: string | null
          song?: string
          student_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          additional_info?: string
          created_at?: string
          id?: string
          legacy_day?: string
          legacy_slot?: string
          klass?: string
          message?: string
          requester?: string
          slot_id?: string | null
          song?: string
          student_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "radio_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "radio_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_rules: {
        Row: {
          id: string
          sort: number
          text: string
        }
        Insert: {
          id?: string
          sort?: number
          text?: string
        }
        Update: {
          id?: string
          sort?: number
          text?: string
        }
        Relationships: []
      }
      radio_slots: {
        Row: {
          created_at: string
          date: string | null
          id: string
          legacy_day: string
          legacy_slot: string
          note: string
          start_time: string | null
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          legacy_day?: string
          legacy_slot?: string
          note?: string
          start_time?: string | null
          state?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          legacy_day?: string
          legacy_slot?: string
          note?: string
          start_time?: string | null
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value?: string
        }
        Update: {
          key?: string
          value?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      close_radio_slot: {
        Args: { p_slot_id: string }
        Returns: {
          slot_id: string
          slot_date: string
          slot_start_time: string
          slot_state: string
          slot_note: string
          slot_created_at: string
          slot_updated_at: string
        }[]
      }
      create_radio_slot: {
        Args: { p_date: string; p_note: string; p_start_time: string }
        Returns: {
          slot_id: string
          slot_date: string
          slot_start_time: string
          slot_state: string
          slot_note: string
          slot_created_at: string
          slot_updated_at: string
        }[]
      }
      reopen_radio_slot: {
        Args: { p_slot_id: string }
        Returns: {
          slot_id: string
          slot_date: string
          slot_start_time: string
          slot_state: string
          slot_note: string
          slot_created_at: string
          slot_updated_at: string
        }[]
      }
      reserve_radio_slot: {
        Args: {
          p_additional_info: string
          p_klass: string
          p_message: string
          p_requester: string
          p_slot_id: string
          p_song: string
          p_student_id: string
        }
        Returns: {
          additional_info: string
          booking_created_at: string
          booking_id: string
          booking_slot_id: string
          booking_status: string
          booking_updated_at: string
          klass: string
          message: string
          requester: string
          slot_date: string
          slot_start_time: string
          slot_state: string
          song: string
          student_id: string
        }[]
      }
      transition_radio_booking: {
        Args: { p_booking_id: string; p_next_status: string }
        Returns: {
          additional_info: string
          booking_created_at: string
          booking_id: string
          booking_slot_id: string
          booking_status: string
          booking_updated_at: string
          klass: string
          message: string
          requester: string
          slot_date: string | null
          slot_start_time: string | null
          slot_state: string | null
          song: string
          student_id: string
        }[]
      }
      update_radio_slot: {
        Args: { p_date: string; p_note: string; p_slot_id: string; p_start_time: string }
        Returns: {
          slot_id: string
          slot_date: string
          slot_start_time: string
          slot_state: string
          slot_note: string
          slot_created_at: string
          slot_updated_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
