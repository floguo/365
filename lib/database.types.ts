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
      memories: {
        Row: {
          id: string
          created_at: string
          date: string
          description: string
          journal_entry: string | null
          intensity: number
          photo_url: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          date: string
          description: string
          journal_entry?: string | null
          intensity: number
          photo_url?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          date?: string
          description?: string
          journal_entry?: string | null
          intensity?: number
          photo_url?: string | null
          user_id?: string
        }
      }
    }
  }
} 