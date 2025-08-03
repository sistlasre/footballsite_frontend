import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import AuthService from '@/services/AuthService';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/types';

export default function SettingsScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadAuthStatus();
  }, []);

  const loadAuthStatus = async () => {
    try {
      const authState = await AuthService.loadAuthState();
      setIsAuthenticated(authState.isAuthenticated);
      setCurrentUser(authState.user || null);
    } catch (error) {
      console.error('Error loading auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              setCurrentUser(null);
              setIsAuthenticated(false);
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>Settings</ThemedText>
        
        {/* User Authentication Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>User Account</ThemedText>
          {isAuthenticated && currentUser ? (
            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle" size={40} color={colors.tint} />
                <View style={styles.userDetails}>
                  <ThemedText style={styles.username}>{currentUser.username}</ThemedText>
                  {currentUser.email && (
                    <ThemedText style={styles.email}>{currentUser.email}</ThemedText>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.logoutButton, { borderColor: colors.text + '30' }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={16} color={colors.text} />
                <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.tint }]}
              onPress={handleLogin}
            >
              <Ionicons name="log-in-outline" size={16} color={colorScheme === 'dark' ? colors.background : 'white'} />
              <ThemedText style={[styles.loginButtonText, { color: colorScheme === 'dark' ? colors.background : 'white' }]}>Login</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* App Information Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About Flag Nation</ThemedText>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="flag" size={20} color={colors.tint} />
              <ThemedText style={styles.infoText}>Version 1.0.0</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people" size={20} color={colors.tint} />
              <ThemedText style={styles.infoText}>Ultimate Frisbee Event Management</ThemedText>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Support</ThemedText>
          <TouchableOpacity style={styles.supportItem}>
            <Ionicons name="help-circle-outline" size={20} color={colors.text} />
            <ThemedText style={styles.supportText}>Help & FAQ</ThemedText>
            <Ionicons name="chevron-forward" size={16} color={colors.text + '50'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportItem}>
            <Ionicons name="mail-outline" size={20} color={colors.text} />
            <ThemedText style={styles.supportText}>Contact Support</ThemedText>
            <Ionicons name="chevron-forward" size={16} color={colors.text + '50'} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoSection: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  supportText: {
    fontSize: 14,
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
