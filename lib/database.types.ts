// Database types for Cricket Scoring App

export interface Database {
  public: {
    Tables: {
      innings: {
        Row: {
          id: string
          created_at: string
          match_id: string
          innings_number: 1 | 2
          batting_team: 'A' | 'B'
          bowling_team: 'A' | 'B'
          total_runs: number
          total_wickets: number
          total_overs: number
          total_balls: number
          is_completed: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          match_id: string
          innings_number: 1 | 2
          batting_team: 'A' | 'B'
          bowling_team: 'A' | 'B'
          total_runs?: number
          total_wickets?: number
          total_overs?: number
          total_balls?: number
          is_completed?: boolean
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          match_id?: string
          innings_number?: 1 | 2
          batting_team?: 'A' | 'B'
          bowling_team?: 'A' | 'B'
          total_runs?: number
          total_wickets?: number
          total_overs?: number
          total_balls?: number
          is_completed?: boolean
          completed_at?: string | null
        }
      }
      balls: {
        Row: {
          id: string
          created_at: string
          match_id: string
          innings_id: string
          over_number: number
          ball_number: number
          striker_id: string
          non_striker_id: string | null
          bowler_id: string
          runs: number
          extras: 'none' | 'wide' | 'no-ball' | 'bye' | 'leg-bye'
          is_wicket: boolean
          dismissal_type: string | null
          fielder_id: string | null
          ball_sequence: number
        }
        Insert: {
          id?: string
          created_at?: string
          match_id: string
          innings_id: string
          over_number: number
          ball_number: number
          striker_id: string
          non_striker_id?: string | null
          bowler_id: string
          runs?: number
          extras?: 'none' | 'wide' | 'no-ball' | 'bye' | 'leg-bye'
          is_wicket?: boolean
          dismissal_type?: string | null
          fielder_id?: string | null
          ball_sequence: number
        }
        Update: {
          id?: string
          created_at?: string
          match_id?: string
          innings_id?: string
          over_number?: number
          ball_number?: number
          striker_id?: string
          non_striker_id?: string | null
          bowler_id?: string
          runs?: number
          extras?: 'none' | 'wide' | 'no-ball' | 'bye' | 'leg-bye'
          is_wicket?: boolean
          dismissal_type?: string | null
          fielder_id?: string | null
          ball_sequence?: number
        }
      }
      player_innings_stats: {
        Row: {
          id: string
          created_at: string
          match_id: string
          innings_id: string
          player_id: string
          runs_scored: number
          balls_faced: number
          fours: number
          sixes: number
          strike_rate: number
          is_out: boolean
          dismissal_type: string | null
          dismissed_by: string | null
          fielder_id: string | null
          overs_bowled: number
          runs_conceded: number
          wickets_taken: number
          economy_rate: number
        }
        Insert: {
          id?: string
          created_at?: string
          match_id: string
          innings_id: string
          player_id: string
          runs_scored?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          strike_rate?: number
          is_out?: boolean
          dismissal_type?: string | null
          dismissed_by?: string | null
          fielder_id?: string | null
          overs_bowled?: number
          runs_conceded?: number
          wickets_taken?: number
          economy_rate?: number
        }
        Update: {
          id?: string
          created_at?: string
          match_id?: string
          innings_id?: string
          player_id?: string
          runs_scored?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          strike_rate?: number
          is_out?: boolean
          dismissal_type?: string | null
          dismissed_by?: string | null
          fielder_id?: string | null
          overs_bowled?: number
          runs_conceded?: number
          wickets_taken?: number
          economy_rate?: number
        }
      }
      overs: {
        Row: {
          id: string
          created_at: string
          match_id: string
          innings_id: string
          over_number: number
          bowler_id: string
          runs_in_over: number
          wickets_in_over: number
          balls_bowled: number
          total_runs: number
          total_wickets: number
          is_completed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          match_id: string
          innings_id: string
          over_number: number
          bowler_id: string
          runs_in_over?: number
          wickets_in_over?: number
          balls_bowled?: number
          total_runs?: number
          total_wickets?: number
          is_completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          match_id?: string
          innings_id?: string
          over_number?: number
          bowler_id?: string
          runs_in_over?: number
          wickets_in_over?: number
          balls_bowled?: number
          total_runs?: number
          total_wickets?: number
          is_completed?: boolean
        }
      }
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