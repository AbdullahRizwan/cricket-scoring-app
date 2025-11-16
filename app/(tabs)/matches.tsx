import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, View } from 'react-native'
import { ActivityIndicator, Card, Divider, IconButton, Text, useTheme } from 'react-native-paper'
import { MatchService } from '../../lib/matchService'

export default function MatchesScreen() {
  const theme = useTheme()
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompletedMatches = async () => {
      setLoading(true)
      setError(null)
      const result = await MatchService.getUserMatches()
      if (result.success && result.matches) {
        // Filter only completed matches
        setMatches(result.matches.filter((m: any) => m.status === 'completed'))
      } else {
        setError(result.error || 'Failed to fetch matches')
      }
      setLoading(false)
    }
    fetchCompletedMatches()
  }, [])

  const deleteMatch = async (matchId: string) => {
    Alert.alert(
      'Delete Match',
      'Are you sure you want to delete this match? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await MatchService.deleteMatch(matchId)
            if (result.success) {
              setMatches(prev => prev.filter(m => m.id !== matchId))
            } else {
              Alert.alert('Error', result.error || 'Failed to delete match')
            }
          }
        }
      ]
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 16, color: theme.colors.onBackground }}>
        Previous Matches
      </Text>
      {loading ? (
        <ActivityIndicator animating size="large" style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={{ color: theme.colors.error, textAlign: 'center' }}>{error}</Text>
      ) : matches.length === 0 ? (
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>No completed matches found.</Text>
      ) : (
        matches.map((match, idx) => {
          // Winner logic: compare scores if available
          let winner = 'N/A'
          if (match.team_a_score != null && match.team_b_score != null) {
            if (match.team_a_score > match.team_b_score) {
              winner = match.team_a_name
            } else if (match.team_b_score > match.team_a_score) {
              winner = match.team_b_name
            } else {
              winner = 'Draw'
            }
          }
          return (
            <Card key={match.id} style={{ marginBottom: 16 }} onPress={() => router.push({ pathname: '/match-details', params: { matchId: match.id } })}>
              <Card.Content>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {match.team_a_name} vs {match.team_b_name}
                </Text>
                <Divider style={{ marginVertical: 8 }} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Date: {match.match_date}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Winner: {winner}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Status: {match.status}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Type: {match.match_type || 'Friendly'}
                </Text>
              </Card.Content>
              <Card.Actions>
                <IconButton icon="delete" onPress={() => deleteMatch(match.id)} />
              </Card.Actions>
            </Card>
          )
        })
      )}
    </View>
  )
}