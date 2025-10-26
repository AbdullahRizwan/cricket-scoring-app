import { router, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper'

export default function MatchScoringScreen() {
  const theme = useTheme()
  const params = useLocalSearchParams()
  
  console.log('🏏 Match Scoring Screen loaded with params:', params)
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            iconColor={theme.colors.onBackground}
          />
          <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, marginLeft: 8 }}>
            Match Scoring (Simple Version)
          </Text>
        </View>

        {/* Parameters Display */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Received Parameters:
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Match ID: {params.matchId || 'Not provided'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Striker: {params.striker || 'Not provided'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Non-Striker: {params.nonStriker || 'Not provided'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Bowler: {params.bowler || 'Not provided'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Batting Team: {params.battingTeam || 'Not provided'}
            </Text>
          </Card.Content>
        </Card>

        {/* Test Score Display */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="headlineLarge" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
              0-0 : 0.0
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Test Score Display
            </Text>
          </Card.Content>
        </Card>

        {/* Test Buttons */}
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Test Scoring Buttons:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[1, 2, 3, 4, 6].map(runs => (
                <Button
                  key={runs}
                  mode="outlined"
                  onPress={() => console.log(`Scored ${runs} runs`)}
                  style={{ minWidth: 60 }}
                >
                  {runs}
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>

      </View>
    </View>
  )
}