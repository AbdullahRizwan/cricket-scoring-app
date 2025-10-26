import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, View } from 'react-native'
import { ActivityIndicator, Button, Card, Text, TextInput, useTheme } from 'react-native-paper'
import { supabase } from '../lib/supabase'
import { useSupabaseSession } from '../lib/useSupabaseSession'

export default function SignupScreen() {
  const { session, loading } = useSupabaseSession()
  const router = useRouter()
  const theme = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (!loading && session) router.replace('/(tabs)')
  }, [loading, session])

  const handleSignup = async () => {
    try {
      setAuthLoading(true)
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      Alert.alert('Account created!', 'Check your inbox to verify your email.')
      router.replace('/login')
    } catch (error: any) {
      Alert.alert('Signup failed', error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: 20 }}>
      <Card style={{ maxWidth: 400, alignSelf: 'center', width: '100%' }}>
        <Card.Content style={{ padding: 24 }}>
          <Text variant="headlineLarge" style={{ textAlign: 'center', marginBottom: 32, color: theme.colors.primary }}>
            Create Account 🏏
          </Text>

          <TextInput
            label="Email"
            mode="outlined"
            placeholder="Enter your email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{ marginBottom: 16 }}
          />

          <TextInput
            label="Password"
            mode="outlined"
            placeholder="Create a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{ marginBottom: 24 }}
          />

          <Button
            mode="contained"
            onPress={handleSignup}
            disabled={authLoading}
            loading={authLoading}
            style={{ marginBottom: 16 }}
          >
            {authLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Already have an account?{' '}
            </Text>
            <Button mode="text" onPress={() => router.push('/login')} compact>
              Login
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  )
}
