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
import { Team } from '@/types';

export default function PlayerTeamsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const teamsData = await FlagNationDataService.getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
      Alert.alert('Error', 'Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('Missing Information', 'Please enter a team name');
      return;
    }

    try {
      await FlagNationDataService.createTeam(
        newTeamName.trim(),
        newTeamDescription.trim() || undefined
      );
      
      // Reset form
      setNewTeamName('');
      setNewTeamDescription('');
      setShowCreateForm(false);
      
      // Reload teams
      loadTeams();
      
      Alert.alert('Success', 'Team created successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team');
    }
  };

  const handleJoinTeam = async (teamId: string, teamName: string) => {
    Alert.alert(
      'Join Team',
      `Do you want to join "${teamName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async () => {
            try {
              await FlagNationDataService.joinTeam(teamId);
              Alert.alert('Success', 'Team join request submitted successfully!');
            } catch (error) {
              console.error('Error joining team:', error);
              Alert.alert('Error', 'Failed to join team');
            }
          },
        },
      ]
    );
  };

  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity 
      style={[styles.teamCard, { backgroundColor: colors.background }]}
      onPress={() => router.push(`/team/${item.id}`)}
    >
      <View style={styles.teamHeader}>
        <ThemedText style={styles.teamName}>{item.name}</ThemedText>
        <Ionicons name="people" size={24} color={colors.tint} />
      </View>
      
      {item.description && (
        <ThemedText style={styles.teamDescription}>{item.description}</ThemedText>
      )}
      
      <View style={styles.teamStats}>
        <ThemedText style={styles.teamMemberCount}>
          {item.memberCount || 0} members
        </ThemedText>
        {item.subTeamCount !== undefined && item.subTeamCount > 0 && (
          <ThemedText style={styles.teamSubTeamCount}>
            {item.subTeamCount} sub-teams
          </ThemedText>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.joinButton, { backgroundColor: colors.tint }]}
        onPress={(e) => {
          e.stopPropagation();
          handleJoinTeam(item.id, item.name);
        }}
      >
        <Ionicons name="person-add" size={16} color={colorScheme === 'dark' ? colors.background : 'white'} />
        <ThemedText style={[styles.joinButtonText, { color: colorScheme === 'dark' ? colors.background : 'white' }]}>
          Join Team
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
          <ThemedText type="title">Create Team</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Team Name *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '20' }]}
              value={newTeamName}
              onChangeText={setNewTeamName}
              placeholder="Enter team name"
              placeholderTextColor={colors.text + '60'}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '20' }]}
              value={newTeamDescription}
              onChangeText={setNewTeamDescription}
              placeholder="Enter team description"
              placeholderTextColor={colors.text + '60'}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.tint }]}
            onPress={handleCreateTeam}
          >
            <ThemedText style={[styles.createButtonText, { color: colorScheme === 'dark' ? colors.background : 'white' }]}>
              Create Team
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
        <ThemedText type="title">Teams</ThemedText>
        <TouchableOpacity onPress={() => setShowCreateForm(true)}>
          <Ionicons name="add" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        renderItem={renderTeam}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={loadTeams}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.text + '40'} />
            <ThemedText style={styles.emptyText}>No teams found</ThemedText>
            <ThemedText style={styles.emptySubtext}>Create your first team to get started</ThemedText>
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
  teamCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  teamDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 18,
    marginBottom: 8,
  },
  teamStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  teamMemberCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  teamSubTeamCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  joinButtonText: {
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
