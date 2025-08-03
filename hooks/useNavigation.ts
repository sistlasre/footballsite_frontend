import { useState, useEffect, useMemo } from 'react';
import { NavigationStackItem } from '../types';
import NavigationService from '../services/NavigationService';

export interface UseNavigationReturn {
  navigationStack: NavigationStackItem[];
  currentItem: NavigationStackItem | null;
  parentItem: NavigationStackItem | null;
  breadcrumbs: string;
  isLoading: boolean;
  
  // Navigation methods
  pushToStack: (item: NavigationStackItem) => Promise<void>;
  popFromStack: () => Promise<void>;
  popMultipleFromStack: (count: number) => Promise<void>;
  clearStack: () => Promise<void>;
  syncStackToCurrentScreen: (currentRoute: string, screenId?: string) => Promise<void>;
  
  // Helper methods for creating stack items
  createEventsStackItem: () => NavigationStackItem;
  createTeamStackItem: (teamId: string, teamName: string) => NavigationStackItem;
  createTeamsStackItem: () => NavigationStackItem;
}

export function useNavigation(): UseNavigationReturn {
  const [navigationStack, setNavigationStack] = useState<NavigationStackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to NavigationService changes
  useEffect(() => {
    console.log('🪝 [useNavigation] Setting up NavigationService subscription...');
    
    const unsubscribe = NavigationService.subscribe((stack) => {
      console.log('🪝 [useNavigation] Navigation stack updated:', stack.map(s => s.name));
      setNavigationStack(stack);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Computed values derived from the navigation stack
  const currentItem = useMemo((): NavigationStackItem | null => {
    return navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;
  }, [navigationStack]);

  const parentItem = useMemo((): NavigationStackItem | null => {
    return navigationStack.length > 1 ? navigationStack[navigationStack.length - 2] : null;
  }, [navigationStack]);

  const breadcrumbs = useMemo((): string => {
    return navigationStack.map(item => item.name).join(' > ');
  }, [navigationStack]);

  // Navigation methods that delegate to NavigationService
  const pushToStack = async (item: NavigationStackItem) => {
    console.log('🪝 [useNavigation] Pushing to stack:', item);
    await NavigationService.pushToStack(item);
  };

  const popFromStack = async () => {
    console.log('🧘 [useNavigation] Popping from stack');
    await NavigationService.popFromStack();
  };

  const popMultipleFromStack = async (count: number) => {
    console.log(`🧘 [useNavigation] Popping ${count} items from stack`);
    await NavigationService.popMultipleFromStack(count);
  };

  const clearStack = async () => {
    console.log('🧘 [useNavigation] Clearing stack');
    await NavigationService.clearStack();
  };

  const syncStackToCurrentScreen = async (currentRoute: string, screenId?: string) => {
    console.log('🔄 [useNavigation] Syncing stack to current screen:', currentRoute, screenId);
    await NavigationService.syncStackToCurrentScreen(currentRoute, screenId);
  };

  return {
    navigationStack,
    currentItem,
    parentItem,
    breadcrumbs,
    isLoading,
    
    // Navigation methods
    pushToStack,
    popFromStack,
    popMultipleFromStack,
    clearStack,
    syncStackToCurrentScreen,
    
    // Helper methods (these are pure functions, no need to wrap them)
    createEventsStackItem: NavigationService.createEventsStackItem,
    createTeamStackItem: NavigationService.createTeamStackItem,
    createTeamsStackItem: NavigationService.createTeamsStackItem,
  };
}
