import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useState, useEffect } from 'react';
import AuthService from '@/services/AuthService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authState = await AuthService.loadAuthState();
      setIsAuthenticated(authState.isAuthenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  if (!loaded || isAuthenticated === null) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="login" 
          options={{ 
            title: 'Sign In',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            title: 'Sign Up',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="events" 
          options={{ 
            title: 'Events',
            headerBackTitle: 'Dashboard'
          }} 
        />
        <Stack.Screen 
          name="player/events" 
          options={{ 
            title: 'Events',
            headerBackTitle: 'Dashboard'
          }} 
        />
        <Stack.Screen 
          name="player/teams" 
          options={{ 
            title: 'Teams',
            headerBackTitle: 'Dashboard'
          }} 
        />
        <Stack.Screen 
          name="player/registrations" 
          options={{ 
            title: 'Registrations',
            headerBackTitle: 'Dashboard'
          }} 
        />
        <Stack.Screen 
          name="team/[id]" 
          options={{ 
            title: 'Team Details',
            headerBackTitle: 'Teams'
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
