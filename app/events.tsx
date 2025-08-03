import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import FlagNationDataService from '@/services/FlagNationDataService';
import { Event } from '@/types';

export default function EventsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDateStart, setNewEventDateStart] = useState('');
  const [newEventDateEnd, setNewEventDateEnd] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

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

  const handleCreateEvent = async () => {
    if (!newEventName.trim() || !newEventLocation.trim() || !newEventDateStart.trim() || !newEventDateEnd.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      await FlagNationDataService.createEvent(
        newEventName.trim(),
        newEventDateStart.trim(),
        newEventDateEnd.trim(),
        newEventLocation.trim(),
        newEventDescription.trim() || undefined
      );
      
      // Reset form
      setNewEventName('');
      setNewEventLocation('');
      setNewEventDateStart('');
      setNewEventDateEnd('');
      setNewEventDescription('');
      setShowCreateForm(false);
      
      // Reload events
      loadEvents();
      
      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
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
              Alert.alert('Success', 'Event registration submitted successfully!');
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
    <TouchableOpacity 
      style={[styles.eventCard, { backgroundColor: colors.background }]}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <View style={styles.eventHeader}>
        <ThemedText style={styles.eventName}>{item.name}</ThemedText>
        <Ionicons name="calendar" size={24} color={colors.tint} />
      </View>
      
      <ThemedText style={styles.eventLocation}>📍 {item.location}</ThemedText>
      <ThemedText style={styles.eventDate}>
        {new Date(item.dateStart).toLocaleDateString()} - {new Date(item.dateEnd).toLocaleDateString()}
      </ThemedText>
      
      {item.description && (
        <ThemedText style={styles.eventDescription}>{item.description}</ThemedText>
      )}
      
      <View style={styles.eventStats}>
        <ThemedText style={styles.eventParticipantCount}>
          {item.playerCount || 0} participants
        </ThemedText>
        {item.teamCount !== undefined && item.teamCount > 0 && (
          <ThemedText style={styles.eventTeamCount}>
            {item.teamCount} teams
          </ThemedText>
        )}
        {item.subEvents !== undefined && item.subEvents.length > 0 && (
          <ThemedText style={styles.eventSubEventCount}>
            {item.subEvents.length} sub-events
          </ThemedText>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.registerButton, { backgroundColor: colors.tint }]}
        onPress={(e) => {
          e.stopPropagation();
          handleRegisterForEvent(item.id, item.name);
        }}
      >
        <Ionicons name="person-add" size={16} color={colorScheme === 'dark' ? colors.background : 'white'} />
        <ThemedText style={[styles.registerButtonText, { color: colorScheme === 'dark' ? colors.background : 'white' }]}>
          Register
        </ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (showCreateForm) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCreateForm(false)}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title">Create Event</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Event Name *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '20' }]}
              value={newEventName}
              onChangeText={setNewEventName}
              placeholder="Enter event name"
              placeholderTextColor={colors.text + '60'}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Location *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '20' }]}
              value={newEventLocation}
              onChangeText={setNewEventLocation}
              placeholder="Enter event location"
              placeholderTextColor={colors.text + '60'}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Start Date * (YYYY-MM-DD)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '20' }]}
              value={newEventDateStart}
              onChangeText={setNewEventDateStart}
              placeholder="2024-12-01"
              placeholderTextColor={colors.text + '60'}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>End Date * (YYYY-MM-DD)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '20' }]}
              value={newEventDateEnd}
              onChangeText={setNewEventDateEnd}
              placeholder="2024-12-01"
              placeholderTextColor={colors.text + '60'}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '20' }]}
              value={newEventDescription}
              onChangeText={setNewEventDescription}
              placeholder="Enter event description"
              placeholderTextColor={colors.text + '60'}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.tint }]}
            onPress={handleCreateEvent}
          >
            <ThemedText style={[styles.createButtonText, { color: colorScheme === 'dark' ? colors.background : 'white' }]}>
              Create Event
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title">Events</ThemedText>
        <TouchableOpacity onPress={() => setShowCreateForm(true)}>
          <Ionicons name="add" size={24} color={colors.tint} />
        </TouchableOpacity>
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
            <ThemedText style={styles.emptyText}>No events found</ThemedText>
            <ThemedText style={styles.emptySubtext}>Create your first event to get started</ThemedText>
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
    marginBottom: 8,
  },
  eventStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  eventParticipantCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  eventTeamCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  eventSubEventCount: {
    fontSize: 14,
    opacity: 0.7,
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
