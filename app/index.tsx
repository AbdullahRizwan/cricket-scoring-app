import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { ActivityIndicator, Text, useTheme } from 'react-native-paper'
import { supabase } from '../lib/supabase'

export default function Index() {
  const [isLoading, setIsLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error checking session:', error)
        router.replace('/login')
        return
      }

      if (session) {
        // User is logged in, redirect to home
        router.replace('/(tabs)/home')
      } else {
        // No session, redirect to login
        router.replace('/login')
      }
    } catch (error) {
      console.error('Unexpected error checking session:', error)
      router.replace('/login')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.colors.background, 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ 
          marginTop: 16, 
          color: theme.colors.onSurfaceVariant 
        }}>
          Loading...
        </Text>
      </View>
    )
  }

  // This should not be reached as we redirect above
  return null
}