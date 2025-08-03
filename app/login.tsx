import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import AuthService from '@/services/AuthService';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both username and password to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const { user, token } = await AuthService.login({
        username: username.trim(),
        password,
      });

      // Save auth state
      await AuthService.saveAuthState({
        user,
        token,
        isAuthenticated: true,
      });

      // Navigate to main app
      router.replace('/');
    } catch (error) {
      console.error('Login error:', error);

      // Provide specific error messages based on error type
      let errorTitle = 'Login Failed';
      let errorMessage = 'Please check your credentials and try again.';

      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();

        if (errorText.includes('invalid') || errorText.includes('unauthorized') || errorText.includes('401')) {
          errorTitle = 'Invalid Credentials';
          errorMessage = 'The username or password you entered is incorrect. Please try again.';
        } else if (errorText.includes('network') || errorText.includes('fetch') || errorText.includes('connection')) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (errorText.includes('timeout')) {
          errorTitle = 'Request Timeout';
          errorMessage = 'The login request timed out. Please try again.';
        } else if (errorText.includes('server') || errorText.includes('500') || errorText.includes('503')) {
          errorTitle = 'Server Error';
          errorMessage = 'The server is currently unavailable. Please try again in a few moments.';
        } else {
          // Use the original error message if it's descriptive enough
          errorMessage = error.message || errorMessage;
        }
      }

      Alert.alert(
        errorTitle,
        errorMessage,
        [
          {
            text: 'Try Again',
            style: 'default',
          },
        ],
        { cancelable: false }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.tint + '20' }]}>
              <Ionicons name="flag" size={48} color={colors.tint} />
            </View>
            <ThemedText type="title" style={styles.title}>
              Flag Nation
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign in to your account
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Username</ThemedText>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: isDark ? colors.text + '08' : colors.text + '05',
                  borderColor: isDark ? colors.text + '20' : colors.text + '15',
                  borderWidth: 1,
                }
              ]}>
                <Ionicons name="person-outline" size={20} color={colors.icon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor={colors.icon}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: isDark ? colors.text + '08' : colors.text + '05',
                  borderColor: isDark ? colors.text + '20' : colors.text + '15',
                  borderWidth: 1,
                }
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.icon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.icon}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton, 
                { 
                  backgroundColor: colors.tint,
                  opacity: isLoading ? 0.8 : 1,
                  shadowColor: isDark ? '#000' : colors.tint,
                  shadowOffset: {
                    width: 0,
                    height: isDark ? 2 : 4,
                  },
                  shadowOpacity: isDark ? 0.3 : 0.2,
                  shadowRadius: isDark ? 3 : 8,
                  elevation: isDark ? 3 : 8,
                }
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={isDark ? '#151718' : '#FFFFFF'} style={styles.spinner} />
                  <ThemedText style={[styles.loginButtonText, { color: isDark ? '#151718' : '#FFFFFF' }]}>
                    Signing In...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={[styles.loginButtonText, { color: isDark ? '#151718' : '#FFFFFF' }]}>
                  Sign In
                </ThemedText>
              )}
            </TouchableOpacity>

          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Don't have an account?{' '}
            </ThemedText>
            <TouchableOpacity onPress={handleRegister}>
              <ThemedText style={[styles.footerLink, { color: colors.tint }]}>
                Sign up
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  passwordToggle: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
  },
});
