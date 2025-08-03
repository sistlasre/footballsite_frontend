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
import { Registration } from '@/types';

export default function PlayerRegistrationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      const registrationsData = await FlagNationDataService.getRegistrations();
      setRegistrations(registrationsData);
    } catch (error) {
      console.error('Error loading registrations:', error);
      Alert.alert('Error', 'Failed to load registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return { name: 'checkmark-circle', color: '#34C759' };
      case 'rejected':
        return { name: 'close-circle', color: '#FF3B30' };
      case 'pending':
      default:
        return { name: 'time', color: '#FF9500' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const renderRegistration = ({ item }: { item: Registration }) => {
    const statusIcon = getStatusIcon(item.status);
    
    return (
      <TouchableOpacity style={[styles.registrationCard, { backgroundColor: colors.background }]}>
        <View style={styles.registrationHeader}>
          <View style={styles.typeContainer}>
            <Ionicons 
              name={item.type === 'event' ? 'calendar' : 'people'} 
              size={20} 
              color={colors.tint} 
            />
            <ThemedText style={styles.typeText}>
              {item.type === 'event' ? 'Event' : 'Team'}
            </ThemedText>
          </View>
          
          <View style={styles.statusContainer}>
            <Ionicons name={statusIcon.name as any} size={20} color={statusIcon.color} />
            <ThemedText style={[styles.statusText, { color: statusIcon.color }]}>
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.registrationDate}>
          Registered: {new Date(item.registeredAt).toLocaleDateString()}
        </ThemedText>
        
        {item.event && (
          <View style={styles.detailsContainer}>
            <ThemedText style={styles.itemName}>{item.event.name}</ThemedText>
            <ThemedText style={styles.itemLocation}>📍 {item.event.location}</ThemedText>
            <ThemedText style={styles.itemDate}>
              {new Date(item.event.dateStart).toLocaleDateString()} - {new Date(item.event.dateEnd).toLocaleDateString()}
            </ThemedText>
          </View>
        )}
        
        {item.team && (
          <View style={styles.detailsContainer}>
            <ThemedText style={styles.itemName}>{item.team.name}</ThemedText>
            {item.team.description && (
              <ThemedText style={styles.itemDescription}>{item.team.description}</ThemedText>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title">My Registrations</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={registrations}
        renderItem={renderRegistration}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={loadRegistrations}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color={colors.text + '40'} />
            <ThemedText style={styles.emptyText}>No registrations found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Register for events or join teams to see them here
            </ThemedText>
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
  registrationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  registrationDate: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 12,
  },
  detailsContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 18,
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
    paddingHorizontal: 32,
  },
});
