import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconSymbol
            size={80}
            color="#0a7ea4"
            name="flag"
            style={styles.headerIcon}
          />
          <ThemedText type="title" style={styles.title}>Welcome to Flag Nation</ThemedText>
          <ThemedText style={styles.subtitle}>
            Your ultimate platform for flag football tournaments and team management
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>🏈 For Players</ThemedText>
          <ThemedText style={styles.sectionText}>
            • Browse and register for exciting flag football events
          </ThemedText>
          <ThemedText style={styles.sectionText}>
            • Create and join teams with your friends
          </ThemedText>
          <ThemedText style={styles.sectionText}>
            • Track your registrations and team memberships
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>🎯 For Organizers</ThemedText>
          <ThemedText style={styles.sectionText}>
            • Create and manage flag football tournaments
          </ThemedText>
          <ThemedText style={styles.sectionText}>
            • Set up events with custom rules and formats
          </ThemedText>
          <ThemedText style={styles.sectionText}>
            • Track team registrations and manage brackets
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>🚀 Getting Started</ThemedText>
          <ThemedText style={styles.sectionText}>
            Navigate through the tabs below to explore events, manage your teams, and view your profile settings.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  headerIcon: {
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: 20,
  },
  sectionText: {
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 24,
  },
});
