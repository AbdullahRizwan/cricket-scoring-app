import { View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

export default function MatchesScreen() {
  const theme = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 16, color: theme.colors.onBackground }}>
        Matches Screen
      </Text>
      <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
        This will show all cricket matches - live, upcoming, and completed.
      </Text>
    </View>
  )
}