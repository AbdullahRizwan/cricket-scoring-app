import { supabase } from './supabase'

export class SimpleDBTest {
  // Simple raw SQL test to bypass TypeScript issues
  static async testRawConnection() {
    try {
      console.log('🔍 Testing raw database connection...')
      
      // Test with raw SQL query
      const { data, error } = await supabase.rpc('select', { 
        query: 'SELECT 1 as test' 
      })
      
      if (error) {
        console.error('❌ Raw connection error:', error)
        return { success: false, error: error.message }
      }
      
      console.log('✅ Raw connection successful!')
      return { success: true, data }
      
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      return { success: false, error: 'Unexpected error' }
    }
  }

  static async testTablesExist() {
    try {
      console.log('🔍 Checking if tables exist...')
      
      // Check if matches table exists
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('count')
        .limit(1)
      
      if (matchesError) {
        console.error('❌ Matches table error:', matchesError.message)
        return { 
          success: false, 
          error: 'Matches table not found: ' + matchesError.message,
          suggestion: 'Please create the database tables using the schema.sql file in Supabase SQL Editor'
        }
      }

      // Check if players table exists  
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('count')
        .limit(1)
      
      if (playersError) {
        console.error('❌ Players table error:', playersError.message)
        return { 
          success: false, 
          error: 'Players table not found: ' + playersError.message,
          suggestion: 'Please create the database tables using the schema.sql file in Supabase SQL Editor'
        }
      }
      
      console.log('✅ Both tables exist!')
      return { success: true }
      
    } catch (err) {
      console.error('❌ Unexpected error checking tables:', err)
      return { success: false, error: 'Unexpected error checking tables' }
    }
  }

  static async createSimpleMatch() {
    try {
      console.log('🏏 Testing simple match creation...')
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { success: false, error: 'Not authenticated' }
      }

      // Create a simple match without TypeScript types
      const matchData = {
        match_date: '2024-10-26',
        team_a_name: 'Simple Team A',
        team_b_name: 'Simple Team B',
        ongoing: true,
        created_by: user.id
      }

      console.log('📝 Creating simple match:', matchData)

      const result = await supabase
        .from('matches')
        .insert(matchData)
        .select()

      console.log('📊 Simple match result:', result)

      return result.error 
        ? { success: false, error: result.error.message }
        : { success: true, data: result.data }
        
    } catch (err) {
      console.error('❌ Error creating simple match:', err)
      return { success: false, error: 'Unexpected error' }
    }
  }
}