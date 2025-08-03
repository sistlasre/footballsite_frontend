import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationStackItem } from '../types';
import FlagNationDataService from './FlagNationDataService';

class NavigationService {
  private static instance: NavigationService;
  private readonly NAVIGATION_STACK_KEY = 'FLAG_NATION_NAVIGATION_STACK';
  private listeners: Array<(stack: NavigationStackItem[]) => void> = [];

  private constructor() {}

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  // Initialize the navigation stack with dashboard as the root
  private getDefaultStack(): NavigationStackItem[] {
    return [
      {
        type: 'dashboard',
        name: 'Dashboard',
        route: '/(tabs)',
      },
    ];
  }

  // Load the navigation stack from app state
  async loadNavigationStack(): Promise<NavigationStackItem[]> {
    try {
      const appState = await FlagNationDataService.loadData();
      if (appState.navigationStack && appState.navigationStack.length > 0) {
        return appState.navigationStack;
      }
    } catch (error) {
      console.error('Error loading navigation stack:', error);
    }

    return this.getDefaultStack();
  }

  // Save the navigation stack to app state
  async saveNavigationStack(stack: NavigationStackItem[]): Promise<void> {
    try {
      const appState = await FlagNationDataService.loadData();
      appState.navigationStack = stack;
      await FlagNationDataService.saveData(appState);
    } catch (error) {
      console.error('Error saving navigation stack:', error);
      throw error;
    }
  }

  // Push a new item to the navigation stack
  async pushToStack(item: NavigationStackItem): Promise<NavigationStackItem[]> {
    console.log(`🧭 [NavigationService] Pushing to stack:`, item);

    const currentStack = await this.loadNavigationStack();

    // Check if the item already exists in the stack
    const existingIndex = currentStack.findIndex(stackItem => 
      stackItem.type === item.type && stackItem.id === item.id
    );

    let newStack: NavigationStackItem[];

    if (existingIndex >= 0) {
      // If item exists, truncate the stack to that point (user navigated back)
      newStack = currentStack.slice(0, existingIndex + 1);
      console.log(`🧭 [NavigationService] Item exists at index ${existingIndex}, truncating stack`);
    } else {
      // Add new item to the stack
      newStack = [...currentStack, item];
      console.log(`🧭 [NavigationService] Adding new item to stack`);
    }

    await this.saveNavigationStack(newStack);
    console.log(`🧭 [NavigationService] New stack:`, newStack.map(s => s.name));

    await this.notifyListeners();
    return newStack;
  }

  // Pop the last item from the navigation stack
  async popFromStack(): Promise<NavigationStackItem[]> {
    console.log(`🧭 [NavigationService] Popping from stack`);

    const currentStack = await this.loadNavigationStack();

    if (currentStack.length <= 1) {
      // Don't pop if we're at the root (dashboard)
      console.log(`🧭 [NavigationService] At root, cannot pop`);
      return currentStack;
    }

    // Clear associated data based on what we're navigating back to
    const itemBeingPopped = currentStack[currentStack.length - 1];
    const newCurrentItem = currentStack[currentStack.length - 2];

    await this.clearAssociatedData([itemBeingPopped], newCurrentItem);

    const newStack = currentStack.slice(0, -1);
    await this.saveNavigationStack(newStack);

    console.log(`🧭 [NavigationService] Popped. New stack:`, newStack.map(s => s.name));

    await this.notifyListeners();
    return newStack;
  }

  // Pop multiple items from the navigation stack
  async popMultipleFromStack(count: number): Promise<NavigationStackItem[]> {
    console.log(`🧭 [NavigationService] Popping ${count} items from stack`);

    const currentStack = await this.loadNavigationStack();

    if (currentStack.length <= 1) {
      // Don't pop if we're at the root (dashboard)
      console.log(`🧭 [NavigationService] At root, cannot pop`);
      return currentStack;
    }

    // Ensure we don't pop more items than we have (keeping at least the dashboard)
    const actualCount = Math.min(count, currentStack.length - 1);

    // Clear associated data for all items being popped
    const itemsBeingPopped = currentStack.slice(-actualCount);
    const newCurrentItem = currentStack[currentStack.length - actualCount - 1];

    await this.clearAssociatedData(itemsBeingPopped, newCurrentItem);

    const newStack = currentStack.slice(0, -actualCount);
    await this.saveNavigationStack(newStack);

    console.log(`🧭 [NavigationService] Popped ${actualCount} items. New stack:`, newStack.map(s => s.name));

    await this.notifyListeners();
    return newStack;
  }

  // Get the current navigation stack
  async getCurrentStack(): Promise<NavigationStackItem[]> {
    return await this.loadNavigationStack();
  }

  // Get the current (top) item in the stack
  async getCurrentItem(): Promise<NavigationStackItem | null> {
    const stack = await this.loadNavigationStack();
    return stack.length > 0 ? stack[stack.length - 1] : null;
  }

  // Get the parent (previous) item in the stack
  async getParentItem(): Promise<NavigationStackItem | null> {
    const stack = await this.loadNavigationStack();
    return stack.length > 1 ? stack[stack.length - 2] : null;
  }

  // Clear the navigation stack and reset to default
  async clearStack(): Promise<NavigationStackItem[]> {
    console.log(`🧭 [NavigationService] Clearing navigation stack`);

    const defaultStack = this.getDefaultStack();
    await this.saveNavigationStack(defaultStack);

    await this.notifyListeners();
    return defaultStack;
  }

  // Generate breadcrumb string from the current stack
  async getBreadcrumbs(): Promise<string> {
    const stack = await this.loadNavigationStack();
    return stack.map(item => item.name).join(' > ');
  }

  // --- Memory Management ---

  /**
   * Clear associated data when navigating back to improve memory management
   * @param itemsBeingPopped - The items being removed from the stack
   * @param newCurrentItem - The item we're navigating back to
   */
  private async clearAssociatedData(
    itemsBeingPopped: NavigationStackItem[], 
    newCurrentItem: NavigationStackItem
  ): Promise<void> {
    console.log(`🧹 [NavigationService] Clearing associated data for memory management`);
    console.log(`🧹 [NavigationService] Items being popped:`, itemsBeingPopped.map(item => `${item.type}:${item.name}`));
    console.log(`🧹 [NavigationService] New current item:`, `${newCurrentItem.type}:${newCurrentItem.name}`);

    try {
      // For Flag Nation, we'll implement more specific data clearing as needed
      // For now, just log the navigation back event
      console.log(`🧹 [NavigationService] Navigation back detected - no specific data clearing implemented yet`);
      console.log(`✅ [NavigationService] Memory management completed successfully`);
    } catch (error) {
      console.error(`❌ [NavigationService] Error during memory management:`, error);
      // Don't throw the error - memory management failure shouldn't break navigation
    }
  }

  // --- Listener Pattern ---

  subscribe = (listener: (stack: NavigationStackItem[]) => void): (() => void) => {
    this.listeners.push(listener);
    // Immediately provide the current stack to the new listener
    this.getCurrentStack().then(stack => listener(stack));
    // Return the unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners = async () => {
    console.log('🧭 [NavigationService] Notifying listeners...');
    const stack = await this.getCurrentStack();
    this.listeners.forEach(listener => listener(stack));
  }

  // Helper method to create a navigation stack item for events list
  createEventsStackItem(): NavigationStackItem {
    return {
      type: 'events',
      name: 'Events',
      route: '/player/events',
    };
  }

  // Helper method to create a navigation stack item for a team
  createTeamStackItem(teamId: string, teamName: string): NavigationStackItem {
    return {
      type: 'team',
      id: teamId,
      name: teamName,
      route: `/team/${teamId}`,
    };
  }

  // Helper method to create a navigation stack item for teams list
  createTeamsStackItem(): NavigationStackItem {
    return {
      type: 'teams',
      name: 'Teams',
      route: '/player/teams',
    };
  }

  // Synchronize stack when a screen comes into focus due to back navigation
  async syncStackToCurrentScreen(currentRoute: string, screenId?: string): Promise<void> {
    console.log(`🔄 [NavigationService] Syncing stack to current screen: ${currentRoute}${screenId ? ` (${screenId})` : ''}`);

    const currentStack = await this.loadNavigationStack();

    // Find the matching item in the current stack
    let targetIndex = -1;

    if (screenId) {
      // Look for exact match with ID
      targetIndex = currentStack.findIndex(item => 
        item.route === currentRoute || 
        (item.id === screenId && item.route.includes(screenId))
      );
    } else {
      // Look for route match
      targetIndex = currentStack.findIndex(item => item.route === currentRoute);
    }

    if (targetIndex >= 0 && targetIndex < currentStack.length - 1) {
      // We found the screen in the stack, but it's not at the top
      // This means user used back navigation - truncate stack to this point
      const itemsBeingPopped = currentStack.slice(targetIndex + 1);
      const newCurrentItem = currentStack[targetIndex];

      console.log(`🔄 [NavigationService] Back navigation detected, truncating stack from index ${targetIndex}`);

      // Clear associated data for items being removed
      await this.clearAssociatedData(itemsBeingPopped, newCurrentItem);

      const newStack = currentStack.slice(0, targetIndex + 1);
      await this.saveNavigationStack(newStack);

      console.log(`🔄 [NavigationService] Stack synchronized:`, newStack.map(s => s.name));
      await this.notifyListeners();
    } else {
      console.log(`🔄 [NavigationService] Screen already at top of stack or not found, no sync needed`);
    }
  }
}

export default NavigationService.getInstance();
