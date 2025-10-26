import { router } from 'expo-router'
import { View } from 'react-native'
import { Button, Text, useTheme } from 'react-native-paper'

export default function TestScoringScreen() {
  const theme = useTheme()
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.colors.background, 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 20
    }}>
      <Text variant="headlineMedium" style={{ 
        color: theme.colors.onBackground, 
        marginBottom: 20,
        textAlign: 'center'
      }}>
        🏏 Match Scoring Screen Test
      </Text>
      
      <Text variant="bodyMedium" style={{ 
        color: theme.colors.onSurfaceVariant, 
        marginBottom: 20,
        textAlign: 'center'
      }}>
        If you can see this, the route is working!
      </Text>
      
      <Button 
        mode="contained"
        onPress={() => router.back()}
        icon="arrow-left"
      >
        Go Back
      </Button>
    </View>
  )
}