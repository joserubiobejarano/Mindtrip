export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          welcome_email_sent_at: string | null
          clerk_user_id: string | null
          is_pro: boolean
          default_currency: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          welcome_email_sent_at?: string | null
          clerk_user_id?: string | null
          is_pro?: boolean
          default_currency?: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          welcome_email_sent_at?: string | null
          clerk_user_id?: string | null
          is_pro?: boolean
          default_currency?: string
          stripe_customer_id?: string | null
        }
      }
      trips: {
        Row: {
          id: string
          title: string
          start_date: string
          end_date: string
          default_currency: string
          owner_id: string
          center_lat: number | null
          center_lng: number | null
          budget_level: string | null
          daily_budget: number | null
          interests: string[] | null
          find_accommodation: boolean | null
          accommodation_address: string | null
          auto_accommodation: Json | null
          destination_name: string | null
          destination_country: string | null
          destination_place_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          start_date: string
          end_date: string
          default_currency: string
          owner_id: string
          center_lat?: number | null
          center_lng?: number | null
          budget_level?: string | null
          daily_budget?: number | null
          interests?: string[] | null
          find_accommodation?: boolean | null
          accommodation_address?: string | null
          auto_accommodation?: Json | null
          destination_name?: string | null
          destination_country?: string | null
          destination_place_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          start_date?: string
          end_date?: string
          default_currency?: string
          owner_id?: string
          center_lat?: number | null
          center_lng?: number | null
          budget_level?: string | null
          daily_budget?: number | null
          interests?: string[] | null
          find_accommodation?: boolean | null
          accommodation_address?: string | null
          auto_accommodation?: Json | null
          destination_name?: string | null
          destination_country?: string | null
          destination_place_id?: string | null
          created_at?: string
        }
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string | null
          email: string | null
          display_name: string | null
          role: string
          swipe_count: number
          change_count: number
          search_add_count: number
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id?: string | null
          email?: string | null
          display_name?: string | null
          role?: string
          swipe_count?: number
          change_count?: number
          search_add_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string | null
          email?: string | null
          display_name?: string | null
          role?: string
          swipe_count?: number
          change_count?: number
          search_add_count?: number
          created_at?: string
        }
      }
      days: {
        Row: {
          id: string
          trip_id: string
          date: string
          day_number: number
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          date: string
          day_number: number
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          date?: string
          day_number?: number
          created_at?: string
        }
      }
      places: {
        Row: {
          id: string
          trip_id: string | null
          name: string
          address: string | null
          lat: number | null
          lng: number | null
          category: string | null
          external_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id?: string | null
          name: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          category?: string | null
          external_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string | null
          name?: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          category?: string | null
          external_id?: string | null
          created_at?: string
        }
      }
      saved_places: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          place_id: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          place_id: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          place_id?: string
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          day_id: string
          place_id: string | null
          title: string
          start_time: string | null
          end_time: string | null
          notes: string | null
          order_number: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          day_id: string
          place_id?: string | null
          title: string
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          order_number?: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          place_id?: string | null
          title?: string
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          order_number?: number
          image_url?: string | null
          created_at?: string
        }
      }
      checklists: {
        Row: {
          id: string
          trip_id: string
          title: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          title: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          title?: string
          created_at?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          checklist_id: string
          title: string
          checked: boolean
          order_number: number
          created_at: string
        }
        Insert: {
          id?: string
          checklist_id: string
          title: string
          checked?: boolean
          order_number?: number
          created_at?: string
        }
        Update: {
          id?: string
          checklist_id?: string
          title?: string
          checked?: boolean
          order_number?: number
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          description: string
          amount: number
          currency: string
          category: string | null
          paid_by_member_id: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          description: string
          amount: number
          currency: string
          category?: string | null
          paid_by_member_id: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          description?: string
          amount?: number
          currency?: string
          category?: string | null
          paid_by_member_id?: string
          created_at?: string
        }
      }
      expense_shares: {
        Row: {
          id: string
          expense_id: string
          member_id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          member_id: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          member_id?: string
          amount?: number
          created_at?: string
        }
      }
      trip_shares: {
        Row: {
          id: string
          trip_id: string
          public_slug: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          public_slug: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          public_slug?: string
          created_at?: string
        }
      }
      trip_regeneration_stats: {
        Row: {
          id: string
          trip_id: string
          date: string
          count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          date: string
          count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          date?: string
          count?: number
          created_at?: string
          updated_at?: string
        }
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
  }
}

