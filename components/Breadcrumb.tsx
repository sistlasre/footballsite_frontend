import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useNavigation } from '../hooks/useNavigation';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';
import { router } from 'expo-router';

interface BreadcrumbProps {
  style?: any;
}

export default function Breadcrumb({ style }: BreadcrumbProps) {
  const { navigationStack, isLoading, popMultipleFromStack } = useNavigation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (isLoading || navigationStack.length <= 1) {
    return null; // Don't show breadcrumbs for just the dashboard
  }

  const handleBreadcrumbPress = async (item: any, index: number) => {
    // Navigate to the selected breadcrumb item
    if (index < navigationStack.length - 1) {
      const stepsBack = navigationStack.length - 1 - index;
      
      // Pop multiple items from our custom navigation stack
      await popMultipleFromStack(stepsBack);
      
      // Use router.back() multiple times to maintain native navigation stack
      for (let i = 0; i < stepsBack; i++) {
        router.back();
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      {navigationStack.map((item, index) => (
        <View key={`${item.type}-${item.id || 'root'}`} style={styles.breadcrumbItem}>
          {index > 0 && (
            <ThemedText style={[styles.separator, { color: colors.text + '60' }]}>
              {' > '}
            </ThemedText>
          )}
          <TouchableOpacity
            onPress={() => handleBreadcrumbPress(item, index)}
            disabled={index === navigationStack.length - 1} // Disable current item
          >
            <ThemedText
              style={[
                styles.breadcrumbText,
                index === navigationStack.length - 1 && styles.currentBreadcrumb,
                { color: index === navigationStack.length - 1 ? colors.text : colors.tint },
              ]}
            >
              {item.name}
            </ThemedText>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentBreadcrumb: {
    fontWeight: '600',
  },
  separator: {
    fontSize: 14,
    marginHorizontal: 4,
  },
});
