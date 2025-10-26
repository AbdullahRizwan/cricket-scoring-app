// Database service for saving scoring data
import { Database } from './database.types'
import { supabase } from './supabase'

type InningsInsert = Database['public']['Tables']['innings']['Insert']
type BallInsert = Database['public']['Tables']['balls']['Insert']
type PlayerStatsInsert = Database['public']['Tables']['player_innings_stats']['Insert']
type OverInsert = Database['public']['Tables']['overs']['Insert']
type MatchUpdate = Database['public']['Tables']['matches']['Update']

export class ScoringService {
  // Create a new innings
  static async createInnings(inningsData: InningsInsert) {
    try {
      const { data, error } = await supabase
        .from('innings')
        .insert(inningsData)
        .select()
        .single()

      if (error) throw error
      return { success: true, innings: data }
    } catch (error: any) {
      console.error('Error creating innings:', error)
      return { success: false, error: error.message }
    }
  }

  // Update innings totals
  static async updateInnings(inningsId: string, updates: Partial<InningsInsert>) {
    try {
      const { data, error } = await supabase
        .from('innings')
        .update(updates)
        .eq('id', inningsId)
        .select()
        .single()

      if (error) throw error
      return { success: true, innings: data }
    } catch (error: any) {
      console.error('Error updating innings:', error)
      return { success: false, error: error.message }
    }
  }

  // Save a ball
  static async saveBall(ballData: BallInsert) {
    try {
      const { data, error } = await supabase
        .from('balls')
        .insert(ballData)
        .select()
        .single()

      if (error) throw error
      return { success: true, ball: data }
    } catch (error: any) {
      console.error('Error saving ball:', error)
      return { success: false, error: error.message }
    }
  }

  // Update or create player innings stats
  static async updatePlayerStats(playerStats: PlayerStatsInsert) {
    try {
      const { data, error } = await supabase
        .from('player_innings_stats')
        .upsert(playerStats, {
          onConflict: 'match_id,innings_id,player_id'
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, stats: data }
    } catch (error: any) {
      console.error('Error updating player stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Save or update over data
  static async saveOver(overData: OverInsert) {
    try {
      const { data, error } = await supabase
        .from('overs')
        .upsert(overData, {
          onConflict: 'match_id,innings_id,over_number'
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, over: data }
    } catch (error: any) {
      console.error('Error saving over:', error)
      return { success: false, error: error.message }
    }
  }

  // Get innings data for a match
  static async getInnings(matchId: string) {
    try {
      const { data, error } = await supabase
        .from('innings')
        .select('*')
        .eq('match_id', matchId)
        .order('innings_number')

      if (error) throw error
      return { success: true, innings: data }
    } catch (error) {
      console.error('Error getting innings:', error)
      return { success: false, error: error.message }
    }
  }

  // Get balls for an innings
  static async getBalls(inningsId: string) {
    try {
      const { data, error } = await supabase
        .from('balls')
        .select('*')
        .eq('innings_id', inningsId)
        .order('ball_sequence')

      if (error) throw error
      return { success: true, balls: data }
    } catch (error) {
      console.error('Error getting balls:', error)
      return { success: false, error: error.message }
    }
  }

  // Get player stats for an innings
  static async getPlayerStats(inningsId: string) {
    try {
      const { data, error } = await supabase
        .from('player_innings_stats')
        .select(`
          *,
          players:player_id (
            id,
            name,
            team
          )
        `)
        .eq('innings_id', inningsId)

      if (error) throw error
      return { success: true, stats: data }
    } catch (error) {
      console.error('Error getting player stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Update match totals (for summary display)
  static async updateMatchTotals(matchId: string, teamAScore: any, teamBScore: any) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({
          team_a_score: teamAScore.runs,
          team_a_wickets: teamAScore.wickets,
          team_a_overs_played: parseFloat(`${teamAScore.overs}.${teamAScore.balls}`),
          team_b_score: teamBScore.runs,
          team_b_wickets: teamBScore.wickets,
          team_b_overs_played: parseFloat(`${teamBScore.overs}.${teamBScore.balls}`),
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single()

      if (error) throw error
      return { success: true, match: data }
    } catch (error) {
      console.error('Error updating match totals:', error)
      return { success: false, error: error.message }
    }
  }
}