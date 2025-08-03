import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SectionList,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, router, useNavigation as useExpoNavigation, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Team, Player } from '@/types';
import FlagNationDataService from '@/services/FlagNationDataService';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@/hooks/useNavigation';
import Breadcrumb from '@/components/Breadcrumb';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expoNavigation = useExpoNavigation();
  const { pushToStack, createTeamStackItem, syncStackToCurrentScreen } = useNavigation();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (id) {
      loadTeam();
    }
  }, [id]);

  // Sync navigation stack when screen comes into focus (handles back button navigation)
  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        console.log('🔍 [TeamDetailScreen] Screen focused, syncing navigation stack for team:', id);
        syncStackToCurrentScreen(`/team/${id}`, id);
      }
    }, [id, syncStackToCurrentScreen])
  );

  const loadTeam = async () => {
    try {
      console.log('🔍 [loadTeam] Starting to load team with id:', id);
      if (id) {
        const teamData = await FlagNationDataService.getTeamDetails(id);
        console.log('🔍 [loadTeam] Received team data:', teamData);

        if (teamData) {
          setTeam(teamData);
          
          // Push team to navigation stack once we have the team data
          await pushToStack(createTeamStackItem(teamData.id, teamData.name));
        } else {
          console.log('🔍 [loadTeam] No team data received');
        }
      } else {
        console.log('🔍 [loadTeam] No id provided');
      }
    } catch (error) {
      console.error('🔍 [loadTeam] Error loading team:', error);
      Alert.alert('Error', 'Failed to load team');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTeam();
  };

  const renderMember = ({ item: player }: { item: Player }) => (
    <View style={[styles.memberCard, { backgroundColor: colors.text + '10' }]}>
      <View style={styles.memberHeader}>
        <ThemedText style={styles.memberName}>{player.name || player.id}</ThemedText>
        <Ionicons name="person" size={20} color={colors.tint} />
      </View>
      {player.email && (
        <ThemedText style={styles.memberDetail}>{player.email}</ThemedText>
      )}
    </View>
  );

  const renderSubTeam = ({ item: subTeam }: { item: Team }) => (
    <TouchableOpacity
      style={[styles.subTeamCard, { backgroundColor: colors.text + '10' }]}
      onPress={() => router.push(`/team/${subTeam.id}`)}
    >
      <View style={styles.subTeamHeader}>
        <View style={styles.subTeamInfo}>
          <ThemedText style={styles.subTeamName}>{subTeam.name}</ThemedText>
          {subTeam.description && (
            <ThemedText style={styles.subTeamDescription}>
              {subTeam.description}
            </ThemedText>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </View>
      <View style={styles.subTeamStats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={14} color={colors.text} />
          <ThemedText style={styles.statText}>
            {subTeam.memberCount || 0} members
          </ThemedText>
        </View>
        {subTeam.subTeamCount !== undefined && subTeam.subTeamCount > 0 && (
          <View style={styles.statItem}>
            <Ionicons name="git-network-outline" size={14} color={colors.text} />
            <ThemedText style={styles.statText}>
              {subTeam.subTeamCount} sub-teams
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!team) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>Team not found</ThemedText>
      </ThemedView>
    );
  }

  const handleCreateSubTeam = () => {
    if (!team) return;

    Alert.prompt(
      'New Sub-Team',
      'Enter sub-team name (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (subTeamName) => {
            try {
              const finalName = subTeamName && subTeamName.trim() ? subTeamName.trim() : `Sub-Team ${(team.subTeams || []).length + 1}`;

              const newSubTeam = await FlagNationDataService.createTeam({ parentId: team.id, name: finalName });

              const updatedTeam = {
                ...team,
                subTeams: [newSubTeam, ...(team.subTeams || [])],
              };
              setTeam(updatedTeam);
              router.push(`/team/${newSubTeam.id}`);
            } catch (error) {
              console.error('Error creating sub-team:', error);
              Alert.alert('Error', 'Failed to create sub-team');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const sections = [];

  if ((team.members || []).length > 0) {
    sections.push({
      title: 'Members',
      data: team.members || [],
      renderItem: renderMember,
    });
  }

  if ((team.subTeams || []).length > 0) {
    sections.push({
      title: 'Sub-Teams',
      data: team.subTeams || [],
      renderItem: renderSubTeam,
    });
  }

  return (
    <ThemedView style={styles.container}>
      <Breadcrumb />
      <View style={styles.header}>
        <View style={styles.teamInfo}>
          <ThemedText type="title">{team.name}</ThemedText>
          {team.description && (
            <ThemedText style={styles.teamDescription}>
              {team.description}
            </ThemedText>
          )}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            onPress={handleCreateSubTeam}
          >
            <Ionicons name="add-circle" size={24} color={colorScheme === 'dark' ? colors.background : 'white'} />
          </TouchableOpacity>
        </View>
      </View>

      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={colors.text + '50'} />
          <ThemedText style={styles.emptyText}>No members or sub-teams</ThemedText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  teamInfo: {
    flex: 1,
  },
  teamDescription: {
    opacity: 0.7,
    marginTop: 4,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.8,
  },
  listContainer: {
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberDetail: {
    fontSize: 14,
    opacity: 0.7,
  },
  subTeamCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  subTeamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subTeamInfo: {
    flex: 1,
  },
  subTeamName: {
    fontSize: 16,
    fontWeight: '500',
  },
  subTeamDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  subTeamStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
});

