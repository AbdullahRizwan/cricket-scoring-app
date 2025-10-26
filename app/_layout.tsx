import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  // Remove hardcoded anchor to let index.tsx handle routing
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const paperTheme = colorScheme === 'light' ? MD3LightTheme : MD3DarkTheme;
  const navigationTheme = colorScheme === 'light' ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="create-match" options={{ headerShown: false }} />
          <Stack.Screen name="continue-match" options={{ headerShown: false }} />
          <Stack.Screen name="match-setup" options={{ headerShown: false }} />
          <Stack.Screen name="match-scoring" options={{ headerShown: false }} />
          <Stack.Screen name="simple-scoring" options={{ headerShown: false }} />
          <Stack.Screen name="test-scoring" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
