import DateTimePicker from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import {
  Button,
  Card,
  IconButton,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper'
import { CreateMatchData, MatchService } from '../lib/matchService'

interface Player {
  id: string
  name: string
}

export default function CreateNewMatchScreen() {
  const theme = useTheme()
  const [matchDate, setMatchDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [teamAName, setTeamAName] = useState('Team A')
  const [teamBName, setTeamBName] = useState('Team B')
  const [teamAPlayerCount, setTeamAPlayerCount] = useState('11')
  const [teamBPlayerCount, setTeamBPlayerCount] = useState('11')
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([])
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setMatchDate(selectedDate)
    }
  }

  const updatePlayerCount = (team: 'A' | 'B', count: string) => {
    const numCount = parseInt(count) || 0
    if (team === 'A') {
      setTeamAPlayerCount(count)
      // Update players array to match count
      const currentPlayers = [...teamAPlayers]
      if (numCount > currentPlayers.length) {
        // Add new players
        for (let i = currentPlayers.length; i < numCount; i++) {
          currentPlayers.push({
            id: `teamA_${i + 1}`,
            name: `Player ${i + 1}`
          })
        }
      } else {
        // Remove excess players
        currentPlayers.splice(numCount)
      }
      setTeamAPlayers(currentPlayers)
    } else {
      setTeamBPlayerCount(count)
      // Update players array to match count
      const currentPlayers = [...teamBPlayers]
      if (numCount > currentPlayers.length) {
        // Add new players
        for (let i = currentPlayers.length; i < numCount; i++) {
          currentPlayers.push({
            id: `teamB_${i + 1}`,
            name: `Player ${i + 1}`
          })
        }
      } else {
        // Remove excess players
        currentPlayers.splice(numCount)
      }
      setTeamBPlayers(currentPlayers)
    }
  }

  const updatePlayerName = (team: 'A' | 'B', index: number, name: string) => {
    if (team === 'A') {
      const updatedPlayers = [...teamAPlayers]
      updatedPlayers[index].name = name
      setTeamAPlayers(updatedPlayers)
    } else {
      const updatedPlayers = [...teamBPlayers]
      updatedPlayers[index].name = name
      setTeamBPlayers(updatedPlayers)
    }
  }

  const handleCreateMatch = async () => {
    if (!teamAName.trim() || !teamBName.trim()) {
      Alert.alert('Validation Error', 'Please enter team names')
      return
    }

    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
      Alert.alert('Validation Error', 'Each team must have at least one player')
      return
    }

    setIsCreating(true)

    try {
      const matchData: CreateMatchData = {
        match_date: matchDate,
        team_a_name: teamAName,
        team_b_name: teamBName,
        team_a_players: teamAPlayers.map(player => ({ name: player.name })),
        team_b_players: teamBPlayers.map(player => ({ name: player.name })),
      }

      console.log('🏏 Creating match with MatchService...')
      const result = await MatchService.createMatch(matchData)
      console.log('📊 MatchService result:', result)

      if (result.success && result.match) {
        console.log('✅ Match created successfully, redirecting to setup:', result.match.id)
        router.replace(`/match-setup?matchId=${result.match.id}`)
      } else {
        Alert.alert('Error', result.error || 'Failed to create match')
      }
    } catch (error) {
      console.error('❌ Error creating match:', error)
      Alert.alert('Error', 'An unexpected error occurred: ' + error)
    } finally {
      setIsCreating(false)
    }
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
          <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, marginLeft: 8 }}>
            Create New Match
          </Text>
        </View>

        {/* Match Date */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Match Date
            </Text>
            <Button
              mode="outlined"
              icon="calendar"
              onPress={() => setShowDatePicker(true)}
              style={{ alignSelf: 'flex-start' }}
            >
              {matchDate.toLocaleDateString()}
            </Button>
            
            {showDatePicker && (
              <DateTimePicker
                value={matchDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </Card.Content>
        </Card>

        {/* Team Names */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Team Names
            </Text>
            <TextInput
              label="Team A Name"
              value={teamAName}
              onChangeText={setTeamAName}
              mode="outlined"
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Team B Name"
              value={teamBName}
              onChangeText={setTeamBName}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Player Counts */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Number of Players
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  label={`${teamAName} Players`}
                  value={teamAPlayerCount}
                  onChangeText={(text) => updatePlayerCount('A', text)}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  label={`${teamBName} Players`}
                  value={teamBPlayerCount}
                  onChangeText={(text) => updatePlayerCount('B', text)}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Team A Players */}
        {teamAPlayers.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
                {teamAName} Players (Optional)
              </Text>
              {teamAPlayers.map((player, index) => (
                <TextInput
                  key={player.id}
                  label={`Player ${index + 1}`}
                  value={player.name}
                  onChangeText={(text) => updatePlayerName('A', index, text)}
                  mode="outlined"
                  style={{ marginBottom: 8 }}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Team B Players */}
        {teamBPlayers.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
                {teamBName} Players (Optional)
              </Text>
              {teamBPlayers.map((player, index) => (
                <TextInput
                  key={player.id}
                  label={`Player ${index + 1}`}
                  value={player.name}
                  onChangeText={(text) => updatePlayerName('B', index, text)}
                  mode="outlined"
                  style={{ marginBottom: 8 }}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 32 }}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={{ flex: 1 }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleCreateMatch}
            style={{ flex: 1 }}
            loading={isCreating}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Match'}
          </Button>
        </View>

      </View>
    </ScrollView>
  )
}