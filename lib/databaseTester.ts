import { supabase } from './supabase'

export class DatabaseTester {
  static async testConnection() {
    try {
      console.log('🔍 Testing Supabase connection...')
      
      // Test basic connection
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .limit(1)
      
      if (error) {
        console.error('❌ Database error:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        return { success: false, error: error.message, details: error }
      }
      
      console.log('✅ Database connection successful!')
      console.log('📊 Sample data:', data)
      return { success: true, data }
      
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      return { success: false, error: 'Unexpected connection error', details: err }
    }
  }

  static async testAuth() {
    try {
      console.log('🔍 Testing authentication...')
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ Auth error:', error)
        return { success: false, error: error.message }
      }
      
      if (!user) {
        console.warn('⚠️ No user logged in')
        return { success: false, error: 'No user logged in' }
      }
      
      console.log('✅ User authenticated:', user.id, user.email)
      return { success: true, user }
      
    } catch (err) {
      console.error('❌ Auth error:', err)
      return { success: false, error: 'Unexpected auth error' }
    }
  }

  static async createTestMatch() {
    try {
      console.log('🏏 Creating test match...')
      
      // Test auth first
      const authResult = await this.testAuth()
      if (!authResult.success) {
        return { success: false, error: 'Authentication failed: ' + authResult.error }
      }

      const testMatchData = {
        match_date: new Date().toISOString().split('T')[0],
        team_a_name: 'Test Team A',
        team_b_name: 'Test Team B',
        ongoing: true,
        status: 'upcoming',
        created_by: authResult.user!.id,
        venue: 'Test Venue',
        match_type: 'Test Match',
        overs: 20,
        team_a_score: 0,
        team_a_wickets: 0,
        team_a_overs_played: 0,
        team_b_score: 0,
        team_b_wickets: 0,
        team_b_overs_played: 0
      }

      console.log('📝 Test match data:', testMatchData)

      const { data, error } = await supabase
        .from('matches')
        .insert([testMatchData])
        .select()

      if (error) {
        console.error('❌ Insert error:', error)
        console.error('❌ Insert error details:', JSON.stringify(error, null, 2))
        return { success: false, error: error.message, details: error }
      }

      console.log('✅ Test match created successfully:', data)
      return { success: true, data }
      
    } catch (err) {
      console.error('❌ Unexpected error creating test match:', err)
      return { success: false, error: 'Unexpected error', details: err }
    }
  }
}