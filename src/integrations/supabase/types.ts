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
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          university: string
          campus: string | null
          course: string | null
          year_of_study: string | null
          phone: string | null
          is_verified: boolean
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          university?: string
          campus?: string | null
          course?: string | null
          year_of_study?: string | null
          phone?: string | null
          is_verified?: boolean
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          university?: string
          campus?: string | null
          course?: string | null
          year_of_study?: string | null
          phone?: string | null
          is_verified?: boolean
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      housing_listings: {
        Row: {
          id: string
          title: string
          category: string
          price: number
          deposit: number | null
          university: string | null
          campus: string | null
          distance_km: number | null
          gender_preference: string | null
          furnished: boolean | null
          wifi: boolean | null
          water_included: boolean | null
          parking: boolean | null
          security: boolean | null
          image_urls: string[] | null
          landlord_name: string | null
          landlord_phone: string | null
          landlord_whatsapp: string | null
          rating: number | null
          availability_status: string | null
          user_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          category?: string
          price: number
          deposit?: number | null
          university?: string | null
          campus?: string | null
          distance_km?: number | null
          gender_preference?: string | null
          furnished?: boolean | null
          wifi?: boolean | null
          water_included?: boolean | null
          parking?: boolean | null
          security?: boolean | null
          image_urls?: string[] | null
          landlord_name?: string | null
          landlord_phone?: string | null
          landlord_whatsapp?: string | null
          rating?: number | null
          availability_status?: string | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          category?: string
          price?: number
          deposit?: number | null
          university?: string | null
          campus?: string | null
          distance_km?: number | null
          gender_preference?: string | null
          furnished?: boolean | null
          wifi?: boolean | null
          water_included?: boolean | null
          parking?: boolean | null
          security?: boolean | null
          image_urls?: string[] | null
          landlord_name?: string | null
          landlord_phone?: string | null
          landlord_whatsapp?: string | null
          rating?: number | null
          availability_status?: string | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          id: string
          title: string
          category: string
          price: number
          condition: string | null
          negotiable: boolean | null
          description: string | null
          images: string[] | null
          seller_id: string | null
          seller_name: string | null
          seller_avatar: string | null
          status: string | null
          rating: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          category?: string
          price: number
          condition?: string | null
          negotiable?: boolean | null
          description?: string | null
          images?: string[] | null
          seller_id?: string | null
          seller_name?: string | null
          seller_avatar?: string | null
          status?: string | null
          rating?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          category?: string
          price?: number
          condition?: string | null
          negotiable?: boolean | null
          description?: string | null
          images?: string[] | null
          seller_id?: string | null
          seller_name?: string | null
          seller_avatar?: string | null
          status?: string | null
          rating?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      campax_services: {
        Row: {
          id: string
          service_type: string
          title: string
          description: string | null
          price: number | null
          contact_phone: string | null
          verified_business: boolean | null
          campus: string | null
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          service_type: string
          title: string
          description?: string | null
          price?: number | null
          contact_phone?: string | null
          verified_business?: boolean | null
          campus?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          service_type?: string
          title?: string
          description?: string | null
          price?: number | null
          contact_phone?: string | null
          verified_business?: boolean | null
          campus?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      campus_updates: {
        Row: {
          id: string
          title: string
          category: string | null
          content: string | null
          campus: string | null
          published_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          category?: string | null
          content?: string | null
          campus?: string | null
          published_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          category?: string | null
          content?: string | null
          campus?: string | null
          published_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          time: string
          location: string | null
          category: string
          image_url: string | null
          host_name: string
          host_avatar: string | null
          attendee_count: number
          max_attendees: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          time: string
          location?: string | null
          category?: string
          image_url?: string | null
          host_name?: string
          host_avatar?: string | null
          attendee_count?: number
          max_attendees?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          time?: string
          location?: string | null
          category?: string
          image_url?: string | null
          host_name?: string
          host_avatar?: string | null
          attendee_count?: number
          max_attendees?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          item_type: string
          item_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: string
          item_id?: string
          created_at?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          item_context: string | null
          item_type: string | null
          item_id: string | null
          last_message: string | null
          last_message_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          item_context?: string | null
          item_type?: string | null
          item_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          item_context?: string | null
          item_type?: string | null
          item_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string | null
          media_url: string | null
          message_type: string | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content?: string | null
          media_url?: string | null
          message_type?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string | null
          media_url?: string | null
          message_type?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Relationships: [{
          foreignKeyName: "chat_messages_chat_id_fkey"
          columns: ["chat_id"]
          isOneToOne: false
          referencedRelation: "chats"
          referencedColumns: ["id"]
        }]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const