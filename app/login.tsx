import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check for active session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error(error);
      if (data?.session) router.replace('/'); // redirect to home if logged in
      else setLoading(false);
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (error) Alert.alert('Login failed', error.message);
    else router.replace('/');
  };

  const goToSignup = () => router.push('/signup');

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Checking session...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-center text-blue-600 mb-8">Cricket Scorer</Text>

      <Text className="text-gray-800 mb-1">Email</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text className="text-gray-800 mb-1">Password</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2 mb-6"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className={`rounded-lg py-3 ${submitting ? 'bg-blue-300' : 'bg-blue-600'}`}
        onPress={handleLogin}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">Login</Text>
        )}
      </TouchableOpacity>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-600">Don’t have an account? </Text>
        <TouchableOpacity onPress={goToSignup}>
          <Text className="text-blue-600 font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
