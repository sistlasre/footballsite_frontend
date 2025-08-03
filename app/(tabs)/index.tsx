import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import AuthService from '@/services/AuthService';
import { User } from '@/types';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARDS_PER_ROW = 2;
const CARD_WIDTH = (width - (CARD_MARGIN * 3)) / CARDS_PER_ROW;

type UserMode = 'player' | 'organizer';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  available: boolean;
}

const organizerItems: DashboardCard[] = [
  {
    id: 'events',
    title: 'Events',
    description: 'Create and manage events',
    icon: 'calendar',
    route: '/events',
    color: '#007AFF',
    available: true,
  },
];

const playerItems: DashboardCard[] = [
  {
    id: 'events',
    title: 'Events',
    description: 'Browse and register for events',
    icon: 'calendar-outline',
    route: '/player/events',
    color: '#34C759',
    available: true,
  },
  {
    id: 'teams',
    title: 'Teams',
    description: 'Create and manage your teams',
    icon: 'people',
    route: '/player/teams',
    color: '#FF9500',
    available: true,
  },
  {
    id: 'registrations',
    title: 'Registrations',
    description: 'View your event and team registrations',
    icon: 'list',
    route: '/player/registrations',
    color: '#FF3B30',
    available: true,
  },
];

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userMode, setUserMode] = useState<UserMode>('player');

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const authState = await AuthService.loadAuthState();
      setIsAuthenticated(authState.isAuthenticated);

      if (authState.isAuthenticated && authState.user) {
        // Get username from token payload
        const payload = AuthService.decodeTokenPayload(authState.token);
        const username = payload ? payload.username : authState.user?.username || 'User';
        setCurrentUser({ ...authState.user, username });
      } else {
        // Redirect to login if not authenticated
        router.replace('/login');
        return;
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const handleCardPress = (item: DashboardCard) => {
    if (!item.available) {
      // Show coming soon message for unavailable features
      return;
    }

    router.push(item.route as any);
  };

  const renderCard = (item: DashboardCard) => {
    const isAvailable = item.available;
    const cardBackgroundColor = isAvailable ? item.color + '15' : colors.text + '10';
    const iconColor = isAvailable ? item.color : colors.text + '50';

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.card,
          { 
            backgroundColor: cardBackgroundColor,
            opacity: isAvailable ? 1 : 0.6,
          }
        ]}
        onPress={() => handleCardPress(item)}
        disabled={!isAvailable}
      >
        <View style={styles.cardContent}>
          <ThemedText style={[styles.fullCardText, { color: iconColor }]}>
            {item.title}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <ThemedText type="title">Welcome back!</ThemedText>
            <ThemedText style={styles.username}>
              {currentUser?.username || 'User'}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.tint }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colorScheme === 'dark' ? colors.background : 'white'} />
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.subtitle}>
          Select a resource to get started
        </ThemedText>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            userMode === 'player' && { backgroundColor: colors.tint },
          ]}
          onPress={() => setUserMode('player')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={userMode === 'player' ? (colorScheme === 'dark' ? colors.background : 'white') : colors.text} 
          />
          <ThemedText style={[
            styles.tabText,
            userMode === 'player' && { color: colorScheme === 'dark' ? colors.background : 'white' }
          ]}>
            Player
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            userMode === 'organizer' && { backgroundColor: colors.tint },
          ]}
          onPress={() => setUserMode('organizer')}
        >
          <Ionicons 
            name="business" 
            size={20} 
            color={userMode === 'organizer' ? (colorScheme === 'dark' ? colors.background : 'white') : colors.text} 
          />
          <ThemedText style={[
            styles.tabText,
            userMode === 'organizer' && { color: colorScheme === 'dark' ? colors.background : 'white' }
          ]}>
            Organizer
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {(userMode === 'player' ? playerItems : organizerItems).map(renderCard)}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.8,
    marginTop: 4,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CARD_MARGIN,
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullCardText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  comingSoonText: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.5,
    marginTop: 4,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
