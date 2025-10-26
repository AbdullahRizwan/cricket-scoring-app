import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text, TextInput, useTheme } from 'react-native-paper';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

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
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Checking session...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: 20 }}>
      <Card style={{ maxWidth: 400, alignSelf: 'center', width: '100%' }}>
        <Card.Content style={{ padding: 24 }}>
          <Text variant="headlineLarge" style={{ textAlign: 'center', marginBottom: 32, color: theme.colors.primary }}>
            Cricket Scorer 🏏
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
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{ marginBottom: 24 }}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={submitting}
            loading={submitting}
            style={{ marginBottom: 16 }}
          >
            {submitting ? 'Logging in...' : 'Login'}
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Don't have an account?{' '}
            </Text>
            <Button mode="text" onPress={goToSignup} compact>
              Sign Up
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}
