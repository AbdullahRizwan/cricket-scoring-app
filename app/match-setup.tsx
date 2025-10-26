import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import {
  Button,
  Card,
  Chip,
  IconButton,
  SegmentedButtons,
  Surface,
  Text,
  useTheme
} from 'react-native-paper'
import { Match, Player } from '../lib/database.types'
import { MatchService } from '../lib/matchService'

export default function MatchSetupScreen() {
  const theme = useTheme()
  const { matchId } = useLocalSearchParams<{ matchId: string }>()
  
  const [match, setMatch] = useState<Match | null>(null)
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([])
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Match state
  const [battingTeam, setBattingTeam] = useState<'A' | 'B'>('A')
  const [bowlingTeam, setBowlingTeam] = useState<'A' | 'B'>('B')
  const [striker, setStriker] = useState<Player | null>(null)
  const [nonStriker, setNonStriker] = useState<Player | null>(null)
  const [bowler, setBowler] = useState<Player | null>(null)
  const [setupComplete, setSetupComplete] = useState(false)

  useEffect(() => {
    if (matchId) {
      loadMatchDetails()
    }
  }, [matchId])

  const loadMatchDetails = async () => {
    try {
      setIsLoading(true)
      const result = await MatchService.getMatchWithPlayers(matchId!)
      
      if (result.success && result.match) {
        setMatch(result.match)
        setTeamAPlayers(result.teamAPlayers || [])
        setTeamBPlayers(result.teamBPlayers || [])
        
        // Set default batting/bowling teams
        setBattingTeam('A')
        setBowlingTeam('B')
      } else {
        Alert.alert('Error', result.error || 'Failed to load match details')
        router.back()
      }
    } catch (error) {
      console.error('Error loading match:', error)
      Alert.alert('Error', 'An unexpected error occurred')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeamSelection = (team: 'A' | 'B') => {
    setBattingTeam(team)
    setBowlingTeam(team === 'A' ? 'B' : 'A')
    // Reset selections when team changes
    setStriker(null)
    setNonStriker(null)
    setBowler(null)
  }

  const handlePlayerSelection = (player: Player, role: 'striker' | 'nonStriker' | 'bowler') => {
    switch (role) {
      case 'striker':
        setStriker(player)
        break
      case 'nonStriker':
        // Can't select same player as striker
        if (player.id !== striker?.id) {
          setNonStriker(player)
        }
        break
      case 'bowler':
        setBowler(player)
        break
    }
  }

  const canStartMatch = () => {
    // Striker and bowler are required, non-striker is optional
    // If non-striker is selected, it must be different from striker
    return striker && bowler && (nonStriker === null || striker.id !== nonStriker.id)
  }

  const handleStartMatch = () => {
    if (canStartMatch()) {
      console.log('🎯 Starting match directly...')
      console.log('Match ID:', matchId)
      console.log('Striker:', striker?.id, striker?.name)
      console.log('Non-Striker:', nonStriker?.id, nonStriker?.name)
      console.log('Bowler:', bowler?.id, bowler?.name)
      console.log('Batting Team:', battingTeam)
      
      // Navigate to full match scoring screen
      const url = `/match-scoring?matchId=${matchId}&striker=${striker!.id}&bowler=${bowler!.id}&battingTeam=${battingTeam}${nonStriker ? `&nonStriker=${nonStriker.id}` : ''}`
      console.log('🔗 Navigating to full scoring screen:', url)
      router.push(url as any)
    }
  }

  const getCurrentBattingPlayers = () => {
    return battingTeam === 'A' ? teamAPlayers : teamBPlayers
  }

  const getCurrentBowlingPlayers = () => {
    return bowlingTeam === 'A' ? teamAPlayers : teamBPlayers
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
          Loading Match...
        </Text>
      </View>
    )
  }

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
          Match Not Found
        </Text>
        <Button onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            iconColor={theme.colors.onBackground}
          />
          <View style={{ marginLeft: 8 }}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
              {match.team_a_name} vs {match.team_b_name}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Match Setup - Select Players
            </Text>
          </View>
        </View>

        {/* Batting Team Selection */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Who Will Bat First?
            </Text>
            <SegmentedButtons
              value={battingTeam}
              onValueChange={handleTeamSelection}
              buttons={[
                {
                  value: 'A',
                  label: match.team_a_name,
                  icon: battingTeam === 'A' ? 'cricket' : undefined
                },
                {
                  value: 'B',
                  label: match.team_b_name,
                  icon: battingTeam === 'B' ? 'cricket' : undefined
                }
              ]}
            />
          </Card.Content>
        </Card>

        {/* Batsman Selection */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Select Batsmen ({battingTeam === 'A' ? match.team_a_name : match.team_b_name})
            </Text>
            
            {/* Striker Selection */}
            <Text variant="titleSmall" style={{ marginBottom: 8, color: theme.colors.primary }}>
              Striker (On Strike):
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {getCurrentBattingPlayers().map((player) => (
                <Chip
                  key={`striker-${player.id}`}
                  selected={striker?.id === player.id}
                  onPress={() => handlePlayerSelection(player, 'striker')}
                  mode={striker?.id === player.id ? 'flat' : 'outlined'}
                >
                  {player.name}
                </Chip>
              ))}
            </View>

            {/* Non-Striker Selection */}
            <Text variant="titleSmall" style={{ marginBottom: 8, color: theme.colors.primary }}>
              Non-Striker (Optional):
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {/* Clear/None option */}
              <Chip
                selected={nonStriker === null}
                onPress={() => setNonStriker(null)}
                mode={nonStriker === null ? 'flat' : 'outlined'}
                icon={nonStriker === null ? 'check' : undefined}
              >
                None
              </Chip>
              
              {getCurrentBattingPlayers()
                .filter(player => player.id !== striker?.id) // Can't select same as striker
                .map((player) => (
                <Chip
                  key={`nonstriker-${player.id}`}
                  selected={nonStriker?.id === player.id}
                  onPress={() => handlePlayerSelection(player, 'nonStriker')}
                  mode={nonStriker?.id === player.id ? 'flat' : 'outlined'}
                >
                  {player.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Bowler Selection */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Select Bowler ({bowlingTeam === 'A' ? match.team_a_name : match.team_b_name})
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {getCurrentBowlingPlayers().map((player) => (
                <Chip
                  key={`bowler-${player.id}`}
                  selected={bowler?.id === player.id}
                  onPress={() => handlePlayerSelection(player, 'bowler')}
                  mode={bowler?.id === player.id ? 'flat' : 'outlined'}
                >
                  {player.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Summary */}
        {(striker || nonStriker || bowler) && (
          <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Match Setup Summary
            </Text>
            <View style={{ gap: 8 }}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Batting: {battingTeam === 'A' ? match.team_a_name : match.team_b_name}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Bowling: {bowlingTeam === 'A' ? match.team_a_name : match.team_b_name}
              </Text>
              {striker && (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Striker: {striker.name}
                </Text>
              )}
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Non-Striker: {nonStriker ? nonStriker.name : 'None (will be added when needed)'}
              </Text>
              {bowler && (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Bowler: {bowler.name}
                </Text>
              )}
            </View>
          </Surface>
        )}

        {/* Start Match Button */}
        <Button
          mode="contained"
          icon="play"
          onPress={handleStartMatch}
          disabled={!canStartMatch()}
          style={{ 
            marginBottom: 32,
            opacity: canStartMatch() ? 1 : 0.6
          }}
        >
          {canStartMatch() ? 'Setup Complete - Begin Match' : 'Select Striker and Bowler to Continue'}
        </Button>

      </View>
    </ScrollView>
  )
}