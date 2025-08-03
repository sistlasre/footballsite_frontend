import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import FlagNationDataService from '@/services/FlagNationDataService';
import { Event } from '@/types';

export default function EventDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const route = useRoute();
  const { eventId } = route.params;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventDetails();
  }, []);

  const loadEventDetails = async () => {
    try {
      setIsLoading(true);
      const eventData = await FlagNationDataService.getEventDetails(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading event details...</ThemedText>
      </ThemedView>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title">{event.name}</ThemedText>
      </View>

      <View style={styles.details}>
        <ThemedText style={styles.info}>📍 {event.location}</ThemedText>
        <ThemedText style={styles.info}>
          {new Date(event.dateStart).toLocaleDateString()} - {new Date(event.dateEnd).toLocaleDateString()}
        </ThemedText>
        <ThemedText style={styles.info}>{event.description}</ThemedText>
        <View style={styles.stats}>
          <ThemedText style={styles.stat}>{event.playerCount} participants</ThemedText>
          <ThemedText style={styles.stat}>{event.teamCount} teams</ThemedText>
          <ThemedText style={styles.stat}>{event.subEvents.length} sub-events</ThemedText>
        </View>
      </View>

      <FlatList
        data={event.subEvents}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.subEventCard, { backgroundColor: colors.background }]}
            onPress={() => router.push(`/event/${item.id}`)}
          >
            <ThemedText>{item.name}</ThemedText>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <ThemedText>No sub-events</ThemedText>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  details: {
    padding: 16,
  },
  info: {
    fontSize: 16,
    marginVertical: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  stat: {
    fontSize: 14,
  },
  subEventCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

