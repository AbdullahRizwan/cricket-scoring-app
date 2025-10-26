// Database types for Cricket Scoring App

export interface Database {
  public: {
    Tables: {
      matches: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          match_date: string
          team_a_name: string
          team_b_name: string
          ongoing: boolean
          status: 'upcoming' | 'live' | 'completed' | 'cancelled'
          created_by: string | null
          venue: string | null
          match_type: string
          overs: number
          team_a_score: number
          team_a_wickets: number
          team_a_overs_played: number
          team_b_score: number
          team_b_wickets: number
          team_b_overs_played: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          match_date: string
          team_a_name: string
          team_b_name: string
          ongoing?: boolean
          status?: 'upcoming' | 'live' | 'completed' | 'cancelled'
          created_by?: string | null
          venue?: string | null
          match_type?: string
          overs?: number
          team_a_score?: number
          team_a_wickets?: number
          team_a_overs_played?: number
          team_b_score?: number
          team_b_wickets?: number
          team_b_overs_played?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          match_date?: string
          team_a_name?: string
          team_b_name?: string
          ongoing?: boolean
          status?: 'upcoming' | 'live' | 'completed' | 'cancelled'
          created_by?: string | null
          venue?: string | null
          match_type?: string
          overs?: number
          team_a_score?: number
          team_a_wickets?: number
          team_a_overs_played?: number
          team_b_score?: number
          team_b_wickets?: number
          team_b_overs_played?: number
        }
      }
      players: {
        Row: {
          id: string
          created_at: string
          match_id: string
          team: 'A' | 'B'
          name: string
          player_number: number
          runs_scored: number
          balls_faced: number
          fours: number
          sixes: number
          is_out: boolean
          dismissal_type: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          match_id: string
          team: 'A' | 'B'
          name: string
          player_number: number
          runs_scored?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          is_out?: boolean
          dismissal_type?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          match_id?: string
          team?: 'A' | 'B'
          name?: string
          player_number?: number
          runs_scored?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          is_out?: boolean
          dismissal_type?: string | null
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

// Type helpers
export type Match = Database['public']['Tables']['matches']['Row']
export type NewMatch = Database['public']['Tables']['matches']['Insert']
export type UpdateMatch = Database['public']['Tables']['matches']['Update']

export type Player = Database['public']['Tables']['players']['Row']
export type NewPlayer = Database['public']['Tables']['players']['Insert']
export type UpdatePlayer = Database['public']['Tables']['players']['Update']