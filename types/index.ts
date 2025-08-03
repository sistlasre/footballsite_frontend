// Flag Nation Types
export interface Event {
  id: string;
  name: string;
  description?: string;
  dateStart: string;
  dateEnd: string;
  location: string;
  createdAt: string;
  organizerId: string;
  parentEventId?: string; // For sub-events
  subEvents: Event[];
  teams: Team[];
  players: Player[];
  registrations: Registration[];
  teamCount?: number;
  playerCount?: number;
  registrationCount?: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  teamCaptainId: string;
  parentTeamId?: string; // For sub-teams
  subTeams: Team[];
  members: Player[];
  events: Event[];
  memberCount?: number;
  subTeamCount?: number;
}

export interface Player {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  teams: Team[];
  events: Event[];
  registrations: Registration[];
}

export interface Registration {
  id: string;
  playerId: string;
  eventId?: string;
  teamId?: string;
  type: 'event' | 'team';
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
  player?: Player;
  event?: Event;
  team?: Team;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
  // Note: We don't store passwords in the state for security
}

export interface AuthState {
  user?: User;
  isAuthenticated: boolean;
  token?: string; // For API authentication
}

export interface NavigationStackItem {
  type: 'dashboard' | 'events' | 'event' | 'teams' | 'team' | 'players' | 'registrations';
  id?: string; // ID of the item (eventId, teamId, playerId)
  name: string; // Display name for the item
  route: string; // Route path for navigation
}

export interface AppState {
  events: Event[];
  teams: Team[];
  players: Player[];
  registrations: Registration[];
  currentEvent?: Event;
  currentTeam?: Team;
  auth: AuthState;
  userId?: string; // Link data to users
  navigationStack: NavigationStackItem[]; // Track user's browsing path
  userRole: 'player' | 'organizer';
}

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    auth: {
      login: string;
      register: string;
      logout: string;
    };
    users: {
      profile: string;
      events: string;
    };
    events: {
      list: string;
      create: string;
      get: string;
      update: string;
      delete: string;
      register: string;
    };
    teams: {
      list: string;
      create: string;
      get: string;
      update: string;
      delete: string;
      join: string;
    };
    players: {
      list: string;
      create: string;
      get: string;
      update: string;
      delete: string;
    };
    registrations: {
      list: string;
      create: string;
      get: string;
      update: string;
      delete: string;
    };
  };
}

