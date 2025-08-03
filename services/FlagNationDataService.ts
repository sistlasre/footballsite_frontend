import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event, Team, Player, Registration, AppState } from '../types';
import AuthService from './AuthService';
import apiConfig from '../config/api.json';

class FlagNationDataService {
  private static instance: FlagNationDataService;
  private readonly STORAGE_KEY = 'FLAG_NATION_DATA';

  private constructor() {}

  static getInstance(): FlagNationDataService {
    if (!FlagNationDataService.instance) {
      FlagNationDataService.instance = new FlagNationDataService();
    }
    return FlagNationDataService.instance;
  }

  // Build API URL with endpoint and parameter substitution
  private buildApiUrl(endpoint: string, params: Record<string, string> = {}): string {
    let url = `${apiConfig.baseUrl}${endpoint}`;

    // Replace path parameters
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });

    return url;
  }

  // Make API requests without local storage fallback
  private async makeApiRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    const startTime = Date.now();
    const method = options.method || 'GET';

    console.log(`🌐 [FLAG_NATION_API ${method}] ${url}`);
    if (options.body) {
      console.log(`📤 [REQUEST BODY]:`, JSON.parse(options.body as string));
    }

    const authHeaders = await AuthService.getAuthHeader();
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: requestHeaders,
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️  [FLAG_NATION_API ${method}] ${url} - ${response.status} ${response.statusText} (${duration}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [FLAG_NATION_API ERROR] ${response.status}: ${response.statusText}`);
      console.error(`📥 [ERROR RESPONSE]:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log(`✅ [FLAG_NATION_API SUCCESS] ${method} ${url}`);
    console.log(`📥 [RESPONSE DATA]:`, responseData);

    return responseData;
  }

  // Generate unique IDs
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Helper method to get the authenticated user ID from token
  private async getAuthenticatedUserId(): Promise<string | null> {
    try {
      const authState = await AuthService.loadAuthState();

      if (!authState.isAuthenticated || !authState.token) {
        return null;
      }

      const tokenPayload = AuthService.decodeTokenPayload(authState.token);
      return tokenPayload?.user_id || tokenPayload?.userId || null;
    } catch (error) {
      console.error('Error getting authenticated user ID:', error);
      return null;
    }
  }

  // Load data from storage
  async loadData(): Promise<AppState> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsedData = JSON.parse(data);
        return this.migrateData(parsedData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }

    // Load auth state
    const authState = await AuthService.loadAuthState();

    return { 
      events: [],
      teams: [],
      players: [],
      registrations: [],
      auth: authState,
      userId: authState.user?.id,
      userRole: 'player',
      navigationStack: [
        {
          type: 'dashboard',
          name: 'Dashboard',
          route: '/(tabs)',
        },
      ],
    };
  }

  // Migrate data to ensure proper structure
  private migrateData(appState: any): AppState {
    const authState = appState.auth || { isAuthenticated: false };

    return {
      events: appState.events || [],
      teams: appState.teams || [],
      players: appState.players || [],
      registrations: appState.registrations || [],
      currentEvent: appState.currentEvent,
      currentTeam: appState.currentTeam,
      auth: authState,
      userId: authState.user?.id || appState.userId,
      userRole: appState.userRole || 'player',
      navigationStack: appState.navigationStack || [
        {
          type: 'dashboard',
          name: 'Dashboard',
          route: '/(tabs)',
        },
      ],
    };
  }

  // Save data to storage
  async saveData(appState: AppState): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  // Event operations
  async getEventDetails(eventId: string): Promise<Event> {
    console.log('🔍 [FlagNationDataService.getEventDetails] Called - fetching from API for event:', eventId);

    const url = this.buildApiUrl(apiConfig.endpoints.events.get, { eventId });

    const response = await this.makeApiRequest(
      url,
      { method: 'GET' }
    );

    const eventResponse = response.event;

    // Transform API response
    const transformedEvent: Event = {
      id: eventResponse.id || eventId,
      name: eventResponse.name,
      dateStart: eventResponse.date_start || eventResponse.dateStart,
      dateEnd: eventResponse.date_end || eventResponse.dateEnd,
      location: eventResponse.location,
      description: eventResponse.description,
      createdAt: eventResponse.created_at || new Date().toISOString(),
      organizerId: eventResponse.organizer_id,
      parentEventId: eventResponse.parent_event_id,
      subEvents: eventResponse.sub_events || [],
      teams: eventResponse.teams || [],
      players: eventResponse.players || [],
      registrations: eventResponse.registrations || [],
      teamCount: (eventResponse.teams || []).length,
      playerCount: (eventResponse.players || []).length,
      registrationCount: (eventResponse.registrations || []).length
    };

    // Update local storage with the API response
    console.log('👶 [FlagNationDataService] Updating local storage with event details from API');
    const appState = await this.loadData();
    appState.currentEvent = transformedEvent;

    // Also update the event in the events array if it exists
    const eventIndex = appState.events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      appState.events[eventIndex] = transformedEvent;
    } else {
      appState.events.unshift(transformedEvent);
    }

    await this.saveData(appState);

    return transformedEvent;
  }

  async createEvent(name: string, dateStart: string, dateEnd: string, location: string, description?: string, parentEventId?: string): Promise<Event> {
    console.log(`📅 [FlagNationDataService] Creating event: "${name}"`);

    const authenticatedUserId = await this.getAuthenticatedUserId();
    if (!authenticatedUserId) {
      throw new Error('User must be authenticated to create events');
    }

    const url = this.buildApiUrl(apiConfig.endpoints.events.create);

    const response = await this.makeApiRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        dateStart,
        dateEnd,
        location,
        organizerId: authenticatedUserId,
        parentEventId,
      }),
    });

    // Transform API response
    const createdEvent: Event = {
      id: response.eventId || response.event_id || response.id,
      name: response.name || name,
      description: response.description || description,
      dateStart: response.dateStart || response.date_start || dateStart,
      dateEnd: response.dateEnd || response.date_end || dateEnd,
      location: response.location || location,
      createdAt: response.createdAt || response.created_at || new Date().toISOString(),
      organizerId: response.organizerId || response.organizer_id || authenticatedUserId,
      parentEventId: response.parentEventId || response.parent_event_id || parentEventId,
      subEvents: response.subEvents || response.sub_events || [],
      teams: response.teams || [],
      players: response.players || [],
      registrations: response.registrations || [],
      teamCount: response.teamCount || response.team_count || 0,
      playerCount: response.playerCount || response.player_count || 0,
      registrationCount: response.registrationCount || response.registration_count || 0,
    };

    // Update local storage with the API response
    console.log('👶 [FlagNationDataService] Updating local storage with created event');
    const appState = await this.loadData();
    appState.events.unshift(createdEvent);
    await this.saveData(appState);

    return createdEvent;
  }

  async getEvents(): Promise<Event[]> {
    console.log('📋 [FlagNationDataService.getEvents] Called - fetching from API');

    const url = this.buildApiUrl(apiConfig.endpoints.events.list);

    const response = await this.makeApiRequest(
      url,
      { method: 'GET' }
    );

    const apiEvents = response.events || response;
    const transformedEvents = apiEvents.map((event: any) => ({
      ...event,
      id: event.eventId || event.event_id || event.id,
      subEvents: event.subEvents || [],
      teams: event.teams || [],
      players: event.players || [],
      registrations: event.registrations || [],
    }));

    // Update local storage with the API response
    console.log('💾 [FlagNationDataService] Updating local storage with events from API');
    const appState = await this.loadData();
    appState.events = transformedEvents;
    await this.saveData(appState);

    return transformedEvents;
  }

  // Team operations
  async createTeam(teamData: { name: string; description?: string; parentId?: string }): Promise<Team>;
  async createTeam(name: string, description?: string, parentTeamId?: string): Promise<Team>;
  async createTeam(
    nameOrTeamData: string | { name: string; description?: string; parentId?: string },
    description?: string,
    parentTeamId?: string
  ): Promise<Team> {
    // Support both old and new call signatures
    let name: string;
    let desc: string | undefined;
    let parentId: string | undefined;

    if (typeof nameOrTeamData === 'string') {
      name = nameOrTeamData;
      desc = description;
      parentId = parentTeamId;
    } else {
      name = nameOrTeamData.name;
      desc = nameOrTeamData.description;
      parentId = nameOrTeamData.parentId;
    }

    console.log(`👥 [FlagNationDataService] Creating team: "${name}"`);

    const authenticatedUserId = await this.getAuthenticatedUserId();
    if (!authenticatedUserId) {
      throw new Error('User must be authenticated to create teams');
    }

    const url = this.buildApiUrl(apiConfig.endpoints.teams.create);

    const response = await this.makeApiRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        team_name: name,
        description: desc,
        team_captain_id: authenticatedUserId,
        parent_team_id: parentId,
      }),
    });

    // Transform API response
    const createdTeam: Team = {
      id: response.teamId || response.team_id || response.id,
      name: response.name || name,
      description: response.description || description,
      createdAt: response.createdAt || response.created_at || new Date().toISOString(),
      teamCaptainId: response.teamCaptainId || response.team_captain_id || authenticatedUserId,
      parentTeamId: response.parentTeamId || response.parent_team_id || parentTeamId,
      subTeams: response.subTeams || response.sub_teams || [],
      members: response.members || [],
      events: response.events || [],
      memberCount: response.memberCount || response.member_count || 0,
      subTeamCount: response.subTeamCount || response.sub_team_count || 0,
    };

    // Update local storage with the API response
    console.log('💾 [FlagNationDataService] Updating local storage with created team');
    const appState = await this.loadData();
    appState.teams.unshift(createdTeam);
    await this.saveData(appState);

    return createdTeam;
  }

  async getTeams(): Promise<Team[]> {
    console.log('📋 [FlagNationDataService.getTeams] Called - fetching from API');
    const authenticatedUserId = await this.getAuthenticatedUserId();
    if (!authenticatedUserId) {
      throw new Error('User must be authenticated to create and see teams');
    }

    const url = this.buildApiUrl(apiConfig.endpoints.users.teams, {"userId": authenticatedUserId});

    const response = await this.makeApiRequest(
      url,
      { method: 'GET' }
    );

    const apiTeams = response.teams || response;
    const transformedTeams = apiTeams.map((team: any) => ({
      ...team,
      id: team.teamId || team.team_id || team.id,
      subTeams: team.subTeams || [],
      members: team.members || [],
      events: team.events || [],
    }));

    // Update local storage with the API response
    console.log('💾 [FlagNationDataService] Updating local storage with teams from API');
    const appState = await this.loadData();
    appState.teams = transformedTeams;
    await this.saveData(appState);

    return transformedTeams;
  }

  async getTeamDetails(teamId: string): Promise<Team> {
    console.log('🔍 [FlagNationDataService.getTeamDetails] Called - fetching from API for team:', teamId);

    const url = this.buildApiUrl(apiConfig.endpoints.teams.get, { teamId });

    const response = await this.makeApiRequest(
      url,
      { method: 'GET' }
    );

    const teamResponse = response.team;

    // Transform API response
    const transformedTeam: Team = {
      id: teamResponse.id || teamId,
      name: teamResponse.name,
      createdAt: teamResponse.created_at || new Date().toISOString(),
      teamCaptainId: teamResponse.team_captain_id,
      parentTeamId: teamResponse.parentTeamId || teamResponse.parent_team_id,
      subTeams: teamResponse.sub_teams || [],
      members: teamResponse.members || [],
      memberCount: (teamResponse.members || []).length,
      subTeamCount: (teamResponse.sub_teams || []).length
    };

    // Update local storage with the API response
    console.log('💾 [FlagNationDataService] Updating local storage with team details from API');
    const appState = await this.loadData();
    appState.currentTeam = transformedTeam;
    
    // Also update the team in the teams array if it exists
    const teamIndex = appState.teams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      appState.teams[teamIndex] = transformedTeam;
    } else {
      appState.teams.unshift(transformedTeam);
    }
    
    await this.saveData(appState);

    return transformedTeam;
  }

  // Registration operations
  async registerForEvent(eventId: string): Promise<Registration> {
    console.log(`📝 [FlagNationDataService] Registering for event: ${eventId}`);

    const authenticatedUserId = await this.getAuthenticatedUserId();
    if (!authenticatedUserId) {
      throw new Error('User must be authenticated to register for events');
    }

    const url = this.buildApiUrl(apiConfig.endpoints.events.register, { eventId });

    const response = await this.makeApiRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        playerId: authenticatedUserId,
        eventId,
      }),
    });

    // Transform API response
    const createdRegistration: Registration = {
      id: response.registrationId || response.registration_id || response.id,
      playerId: response.playerId || response.player_id || authenticatedUserId,
      eventId: response.eventId || response.event_id || eventId,
      type: 'event',
      status: response.status || 'pending',
      registeredAt: response.registeredAt || response.registered_at || new Date().toISOString(),
      event: response.event,
    };

    // Update local storage with the API response
    console.log('💾 [FlagNationDataService] Updating local storage with event registration');
    const appState = await this.loadData();
    appState.registrations.unshift(createdRegistration);
    await this.saveData(appState);

    return createdRegistration;
  }

  async joinTeam(teamId: string): Promise<Registration> {
    console.log(`👥 [FlagNationDataService] Joining team: ${teamId}`);

    const authenticatedUserId = await this.getAuthenticatedUserId();
    if (!authenticatedUserId) {
      throw new Error('User must be authenticated to join teams');
    }

    const url = this.buildApiUrl(apiConfig.endpoints.teams.join, { teamId });

    const response = await this.makeApiRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        playerId: authenticatedUserId,
        teamId,
      }),
    });

    // Transform API response
    const createdRegistration: Registration = {
      id: response.registrationId || response.registration_id || response.id,
      playerId: response.playerId || response.player_id || authenticatedUserId,
      teamId: response.teamId || response.team_id || teamId,
      type: 'team',
      status: response.status || 'pending',
      registeredAt: response.registeredAt || response.registered_at || new Date().toISOString(),
      team: response.team,
    };

    // Update local storage with the API response
    console.log('💾 [FlagNationDataService] Updating local storage with team registration');
    const appState = await this.loadData();
    appState.registrations.unshift(createdRegistration);
    await this.saveData(appState);

    return createdRegistration;
  }

  async getRegistrations(): Promise<Registration[]> {
    console.log('📋 [FlagNationDataService.getRegistrations] Called - fetching from API');

    const authenticatedUserId = await this.getAuthenticatedUserId();
    if (!authenticatedUserId) {
      throw new Error('User must be authenticated to view registrations');
    }

    const url = this.buildApiUrl(apiConfig.endpoints.registrations.list);

    const response = await this.makeApiRequest(
      url,
      { method: 'GET' }
    );

    const apiRegistrations = response.registrations || response;
    const transformedRegistrations = apiRegistrations.map((registration: any) => ({
      ...registration,
      id: registration.registrationId || registration.registration_id || registration.id,
      playerId: registration.playerId || registration.player_id,
      eventId: registration.eventId || registration.event_id,
      teamId: registration.teamId || registration.team_id,
      type: registration.type || (registration.eventId || registration.event_id ? 'event' : 'team'),
      status: registration.status || 'pending',
      registeredAt: registration.registeredAt || registration.registered_at,
      event: registration.event,
      team: registration.team,
    }));

    // Update local storage with the API response
    console.log('💾 [FlagNationDataService] Updating local storage with registrations from API');
    const appState = await this.loadData();
    appState.registrations = transformedRegistrations;
    await this.saveData(appState);

    return transformedRegistrations;
  }

  // Clear all data when logging out
  async clearAllData(): Promise<void> {
    console.log('🧹 [FlagNationDataService.clearAllData] Clearing all app state data for logout');

    const clearedAppState: AppState = {
      events: [],
      teams: [],
      players: [],
      registrations: [],
      currentEvent: undefined,
      currentTeam: undefined,
      auth: { isAuthenticated: false },
      userId: undefined,
      userRole: 'player',
      navigationStack: [
        {
          type: 'dashboard',
          name: 'Dashboard',
          route: '/(tabs)',
        },
      ],
    };

    await this.saveData(clearedAppState);
    console.log('✅ [FlagNationDataService.clearAllData] All app state data cleared');
  }
}

export default FlagNationDataService.getInstance();
