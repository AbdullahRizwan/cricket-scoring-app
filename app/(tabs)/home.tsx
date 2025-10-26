import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper'
import { supabase } from '../../lib/supabase'

export default function HomeScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const theme = useTheme()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserEmail(data.user.email || null)
      else router.replace('/login')
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <View>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
              Cricket Scorer 🏏
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Welcome back, {userEmail?.split('@')[0] || 'Scorer'}
            </Text>
          </View>
          <IconButton
            icon="logout"
            mode="outlined"
            onPress={handleLogout}
            iconColor={theme.colors.error}
          />
        </View>

        {/* Main Actions */}
        <View style={{ paddingHorizontal: 16 }}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => router.push('/create-match')}
            style={{ marginBottom: 16 }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Create a New Match
          </Button>
          
          {/* Continue Previous Match Button */}
          <Card style={{ marginBottom: 16 }}>
            <Card.Content style={{ padding: 20 }}>
              <Button
                mode="outlined"
                icon="play-circle"
                style={{ height: 50 }}
                labelStyle={{ fontSize: 16 }}
                onPress={() => router.push('/continue-match')}
              >
                Continue a Previous Match
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
    </View>
  )
}