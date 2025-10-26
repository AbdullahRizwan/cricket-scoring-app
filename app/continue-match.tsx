import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, RefreshControl, ScrollView, View } from 'react-native'
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Dialog,
    IconButton,
    Portal,
    Surface,
    Text,
    useTheme
} from 'react-native-paper'
import { Match } from '../lib/database.types'
import { MatchService } from '../lib/matchService'

export default function ContinueMatchScreen() {
  const theme = useTheme()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingMatches, setDeletingMatches] = useState<Set<string>>(new Set())
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null)

  useEffect(() => {
    loadOngoingMatches()
  }, [])

  const loadOngoingMatches = async () => {
    try {
      setIsLoading(true)
      const result = await MatchService.getOngoingMatches()
      
      if (result.success) {
        setMatches(result.matches || [])
      } else {
        console.error('Error loading ongoing matches:', result.error)
      }
    } catch (error) {
      console.error('Unexpected error loading matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadOngoingMatches()
    setIsRefreshing(false)
  }

  const handleContinueMatch = (match: Match) => {
    console.log('Continue match:', match.id)
    router.push(`/match-setup?matchId=${match.id}`)
  }

  const handleDeleteMatch = async (match: Match) => {
    console.log('🔍 Delete button pressed for match:', match.id, match.team_a_name, 'vs', match.team_b_name)
    
    // Try Alert first, if it doesn't work, fall back to custom dialog
    try {
      Alert.alert(
        'Delete Match',
        `Are you sure you want to delete the match between ${match.team_a_name} vs ${match.team_b_name}?\n\nThis action cannot be undone and will also delete all player data.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('🚫 Delete cancelled')
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              console.log('⚠️ User confirmed delete for match:', match.id)
              await handleActualDelete(match)
            }
          }
        ]
      )
    } catch (error) {
      console.log('❌ Alert failed, using custom dialog:', error)
      // Fallback to custom dialog
      setMatchToDelete(match)
      setDeleteDialogVisible(true)
    }
  }

  const handleActualDelete = async (match: Match) => {
    try {
      // Add to deleting set to show loading state
      console.log('🔄 Adding to deleting set:', match.id)
      setDeletingMatches(prev => new Set(prev).add(match.id))

      console.log('🗑️ Calling MatchService.deleteMatch for:', match.id)
      const result = await MatchService.deleteMatch(match.id)
      
      console.log('📊 MatchService.deleteMatch result:', result)

      if (result.success) {
        console.log('✅ Match deleted successfully from database')
        
        // Remove from matches list in UI
        console.log('🔄 Removing match from UI list')
        setMatches(prevMatches => {
          const newMatches = prevMatches.filter(m => m.id !== match.id)
          console.log('📝 Updated matches list length:', newMatches.length)
          return newMatches
        })
        
        alert('Success! Match deleted successfully!')
      } else {
        console.error('❌ Delete failed:', result.error)
        alert('Error: ' + (result.error || 'Failed to delete match'))
      }
    } catch (error) {
      console.error('❌ Unexpected error deleting match:', error)
      alert('Error: An unexpected error occurred while deleting the match')
    } finally {
      // Remove from deleting set
      console.log('🔄 Removing from deleting set:', match.id)
      setDeletingMatches(prev => {
        const newSet = new Set(prev)
        newSet.delete(match.id)
        return newSet
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return theme.colors.error
      case 'upcoming':
        return theme.colors.primary
      default:
        return theme.colors.outline
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Loading ongoing matches...
        </Text>
      </View>
    )
  }

  return (
    <>
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      <View style={{ padding: 16 }}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            iconColor={theme.colors.onBackground}
          />
          <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, marginLeft: 8 }}>
            Continue a Match
          </Text>
        </View>

        {matches.length === 0 ? (
          <Surface style={{ padding: 24, alignItems: 'center', borderRadius: 12, marginTop: 32 }}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              No Ongoing Matches
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 }}>
              You don't have any matches in progress. Create a new match to get started!
            </Text>
            <Button 
              mode="contained" 
              icon="plus"
              onPress={() => router.replace('/create-match')}
            >
              Create New Match
            </Button>
          </Surface>
        ) : (
          <>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              Found {matches.length} ongoing match{matches.length !== 1 ? 'es' : ''}
            </Text>

            {matches.map((match) => (
              <Card key={match.id} style={{ marginBottom: 16 }}>
                <Card.Content style={{ padding: 20 }}>
                  
                  {/* Match Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 4 }}>
                        {match.team_a_name} vs {match.team_b_name}
                      </Text>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatDate(match.match_date)}
                      </Text>
                    </View>
                    <Chip 
                      mode="outlined"
                      textStyle={{ 
                        color: getStatusColor(match.status),
                        fontSize: 10,
                        fontWeight: 'bold'
                      }}
                      style={{ 
                        borderColor: getStatusColor(match.status),
                      }}
                    >
                      {match.status.toUpperCase()}
                    </Chip>
                  </View>

                  {/* Current Score (if available) */}
                  {(match.team_a_score > 0 || match.team_b_score > 0) && (
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between',
                      backgroundColor: theme.colors.surfaceVariant,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12
                    }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {match.team_a_name}
                        </Text>
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                          {match.team_a_score}/{match.team_a_wickets}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          ({match.team_a_overs_played} overs)
                        </Text>
                      </View>
                      
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          vs
                        </Text>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {match.team_b_name}
                        </Text>
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                          {match.team_b_score}/{match.team_b_wickets}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          ({match.team_b_overs_played} overs)
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Match Details */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Type: {match.match_type}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Overs: {match.overs}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Button
                      mode="contained"
                      icon="play"
                      onPress={() => handleContinueMatch(match)}
                      style={{ flex: 1 }}
                      disabled={deletingMatches.has(match.id)}
                    >
                      Continue Match
                    </Button>
                    <Button
                      mode="outlined"
                      icon="delete"
                      onPress={() => {
                        console.log('🔴 DELETE BUTTON PRESSED FOR:', match.team_a_name, 'vs', match.team_b_name)
                        
                        const confirmed = confirm(`Are you sure you want to delete the match between ${match.team_a_name} vs ${match.team_b_name}? This cannot be undone.`)
                        
                        if (confirmed) {
                          console.log('✅ User confirmed deletion')
                          handleActualDelete(match)
                        } else {
                          console.log('❌ User cancelled deletion')
                        }
                      }}
                      style={{ 
                        borderColor: theme.colors.error,
                      }}
                      textColor={theme.colors.error}
                      loading={deletingMatches.has(match.id)}
                      disabled={deletingMatches.has(match.id)}
                    >
                      Delete
                    </Button>
                  </View>

                </Card.Content>
              </Card>
            ))}
          </>
        )}

      </View>
    </ScrollView>
    
    {/* Custom Delete Dialog (fallback if Alert doesn't work) */}
    <Portal>
      <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
        <Dialog.Title>Delete Match</Dialog.Title>
        <Dialog.Content>
          {matchToDelete && (
            <Text variant="bodyMedium">
              Are you sure you want to delete the match between {matchToDelete.team_a_name} vs {matchToDelete.team_b_name}?
              {'\n\n'}
              This action cannot be undone and will also delete all player data.
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
          <Button 
            onPress={async () => {
              if (matchToDelete) {
                setDeleteDialogVisible(false)
                await handleActualDelete(matchToDelete)
                setMatchToDelete(null)
              }
            }}
            textColor={theme.colors.error}
          >
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
    </>
  )
}