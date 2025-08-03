import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import FlagNationDataService from '@/services/FlagNationDataService';
import { Event } from '@/types';

export default function PlayerEventsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await FlagNationDataService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterForEvent = async (eventId: string, eventName: string) => {
    Alert.alert(
      'Register for Event',
      `Do you want to register for "${eventName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            try {
              await FlagNationDataService.registerForEvent(eventId);
              Alert.alert('Success', 'Registration submitted successfully!');
            } catch (error) {
              console.error('Error registering for event:', error);
              Alert.alert('Error', 'Failed to register for event');
            }
          },
        },
      ]
    );
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity style={[styles.eventCard, { backgroundColor: colors.background }]}>
      <View style={styles.eventHeader}>
        <ThemedText style={styles.eventName}>{item.name}</ThemedText>
        <Ionicons name="calendar-outline" size={24} color={colors.tint} />
      </View>
      <ThemedText style={styles.eventLocation}>📍 {item.location}</ThemedText>
      <ThemedText style={styles.eventDate}>
        {new Date(item.dateStart).toLocaleDateString()} - {new Date(item.dateEnd).toLocaleDateString()}
      </ThemedText>
      {item.description && (
        <ThemedText style={styles.eventDescription}>{item.description}</ThemedText>
      )}
      
      <TouchableOpacity
        style={[styles.registerButton, { backgroundColor: colors.tint }]}
        onPress={() => handleRegisterForEvent(item.id, item.name)}
      >
        <Ionicons name="person-add" size={16} color={colorScheme === 'dark' ? colors.background : 'white'} />
        <ThemedText style={[styles.registerButtonText, { color: colorScheme === 'dark' ? colors.background : 'white' }]}>
          Register
        </ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title">Browse Events</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={loadEvents}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.text + '40'} />
            <ThemedText style={styles.emptyText}>No events available</ThemedText>
            <ThemedText style={styles.emptySubtext}>Check back later for new events</ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  placeholder: {
    width: 24,
  },
  list: {
    padding: 16,
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  eventLocation: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 18,
    marginBottom: 12,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 8,
    textAlign: 'center',
  },
});
