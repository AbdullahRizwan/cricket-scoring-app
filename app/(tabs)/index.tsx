import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserEmail(data.user.email)
      else router.replace('/login')
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
      <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Welcome, {userEmail ? userEmail : 'Guest'} 🎉
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-8">
        You’re logged in successfully!
      </Text>
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold text-lg">Logout</Text>
      </TouchableOpacity>
    </View>
  )
}
