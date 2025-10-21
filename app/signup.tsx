import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { useSupabaseSession } from '../lib/useSupabaseSession'

export default function SignupScreen() {
  const { session, loading } = useSupabaseSession()
  const router = useRouter()

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
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50 justify-center items-center px-6">
      <View className="w-full bg-white p-6 rounded-2xl shadow-lg">
        <Text className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Create Account 🏏</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-800"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-gray-800"
        />

        <TouchableOpacity
          onPress={handleSignup}
          disabled={authLoading}
          className={`py-3 rounded-xl ${authLoading ? 'bg-green-400' : 'bg-green-600'}`}
        >
          <Text className="text-center text-white text-lg font-semibold">
            {authLoading ? 'Signing up...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} className="mt-5">
          <Text className="text-center text-blue-600 font-medium">
            Already have an account? <Text className="font-semibold underline">Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
