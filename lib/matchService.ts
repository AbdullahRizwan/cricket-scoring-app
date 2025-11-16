import { Match, NewPlayer, Player } from './database.types'
import { supabase } from './supabase'

export interface CreateMatchData {
  match_date: Date
  team_a_name: string
  team_b_name: string
  team_a_players: Array<{ name: string }>
  team_b_players: Array<{ name: string }>
  venue?: string
  match_type?: string
  overs?: number
}

export class MatchService {
  /**
   * Create a new cricket match with players
   */
  static async createMatch(data: CreateMatchData): Promise<{ success: boolean; match?: Match; error?: string }> {
    try {
      console.log('🏏 Creating match with data:', JSON.stringify(data, null, 2))
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('❌ User authentication error:', userError)
        return { success: false, error: 'User not authenticated' }
      }
      
      console.log('✅ User authenticated:', user.id)

      // First, let's check if the matches table exists
      console.log('🔍 Testing database connection...')
      const { data: testData, error: testError } = await supabase
        .from('matches')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('❌ Database connection/table error:', testError)
        return { success: false, error: `Database error: ${testError.message}` }
      }
      
      console.log('✅ Database connection successful')

      // Prepare match data
      const matchData = {
        match_date: data.match_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        team_a_name: data.team_a_name.trim(),
        team_b_name: data.team_b_name.trim(),
        ongoing: true, // All new matches start as ongoing
        status: 'upcoming',
        created_by: user.id,
        venue: data.venue?.trim() || null,
        match_type: data.match_type || 'friendly',
        overs: data.overs || 20
      }

      console.log('📝 Inserting match data:', matchData)

      // Create the match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
        .single()

      if (matchError) {
        console.error('❌ Error creating match:', matchError)
        console.error('❌ Match error details:', JSON.stringify(matchError, null, 2))
        return { success: false, error: matchError.message }
      }

      console.log('✅ Match created successfully:', match)

      // Prepare players data
      const playersData: NewPlayer[] = []

      // Add Team A players
      data.team_a_players.forEach((player, index) => {
        playersData.push({
          match_id: match.id,
          team: 'A',
          name: player.name.trim() || `Player ${index + 1}`,
          player_number: index + 1
        })
      })

      // Add Team B players
      data.team_b_players.forEach((player, index) => {
        playersData.push({
          match_id: match.id,
          team: 'B',
          name: player.name.trim() || `Player ${index + 1}`,
          player_number: index + 1
        })
      })

      // Insert all players
      const { error: playersError } = await supabase
        .from('players')
        .insert(playersData)

      if (playersError) {
        console.error('Error creating players:', playersError)
        // If players creation fails, we should cleanup the match
        await supabase.from('matches').delete().eq('id', match.id)
        return { success: false, error: playersError.message }
      }

      return { success: true, match }

    } catch (error) {
      console.error('Unexpected error creating match:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get all matches for the current user
   */
  static async getUserMatches(): Promise<{ success: boolean; matches?: Match[]; error?: string }> {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching matches:', error)
        return { success: false, error: error.message }
      }

      return { success: true, matches: matches || [] }

    } catch (error) {
      console.error('Unexpected error fetching matches:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get ongoing matches for the current user
   */
  static async getOngoingMatches(): Promise<{ success: boolean; matches?: Match[]; error?: string }> {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('ongoing', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching ongoing matches:', error)
        return { success: false, error: error.message }
      }

      return { success: true, matches: matches || [] }

    } catch (error) {
      console.error('Unexpected error fetching ongoing matches:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get a specific match with its players
   */
  static async getMatchWithPlayers(matchId: string): Promise<{ 
    success: boolean; 
    match?: Match; 
    teamAPlayers?: Player[];
    teamBPlayers?: Player[];
    error?: string 
  }> {
    try {
      // Get match details
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()

      if (matchError) {
        console.error('Error fetching match:', matchError)
        return { success: false, error: matchError.message }
      }

      // Get players for this match
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('match_id', matchId)
        .order('player_number', { ascending: true })

      if (playersError) {
        console.error('Error fetching players:', playersError)
        return { success: false, error: playersError.message }
      }

      // Separate players by team
      const teamAPlayers = players?.filter(p => p.team === 'A') || []
      const teamBPlayers = players?.filter(p => p.team === 'B') || []

      return { 
        success: true, 
        match, 
        teamAPlayers, 
        teamBPlayers 
      }

    } catch (error) {
      console.error('Unexpected error fetching match with players:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update match status (ongoing, completed, etc.)
   */
  static async updateMatchStatus(matchId: string, ongoing: boolean, status?: 'upcoming' | 'live' | 'completed' | 'cancelled', additionalData?: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { ongoing, ...additionalData }
      if (status) {
        updateData.status = status
      }

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)

      if (error) {
        console.error('Error updating match status:', error)
        return { success: false, error: error.message }
      }

      return { success: true }

    } catch (error) {
      console.error('Unexpected error updating match status:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Delete a match and all associated players
   */
  static async deleteMatch(matchId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting match:', matchId)

      // Get current user to verify ownership
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('❌ User authentication error:', userError)
        return { success: false, error: 'User not authenticated' }
      }

      // Delete the match (players will be deleted automatically due to CASCADE)
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
        .eq('created_by', user.id) // Ensure user can only delete their own matches

      if (error) {
        console.error('❌ Error deleting match:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Match deleted successfully')
      return { success: true }

    } catch (error) {
      console.error('❌ Unexpected error deleting match:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}