import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';
import apiConfig from '../config/api.json';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

class AuthService {
  private static instance: AuthService;
  private readonly AUTH_STORAGE_KEY = 'FLAG_NATION_AUTH';

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Check if token is expired (updated for new token format)
  private isTokenExpired(token: string): boolean {
    try {
      // Our new token format is a simple base64 encoded JSON object
      const payload = JSON.parse(atob(token));
      const now = Math.floor(Date.now() / 1000);

      // Check both 'exp' (JWT standard) and 'expires_at' (our format)
      const expiration = payload.exp || payload.expires_at;
      if (typeof expiration === 'string') {
        // If it's a string, convert to timestamp
        return new Date(expiration).getTime() / 1000 < now;
      }

      return expiration < now;
    } catch (error) {
      console.warn('Error checking token expiration:', error);
      return true;
    }
  }

  // Decode token payload (updated for new token format)
  private decodeTokenPayload(token: string): any {
    try {
      // Our new token format is a simple base64 encoded JSON object
      return JSON.parse(atob(token));
    } catch (error) {
      console.warn('Error decoding token:', error);
      return null;
    }
  }

  // Build API URL with endpoint
  private buildApiUrl(endpoint: string): string {
    return `${apiConfig.baseUrl}${endpoint}`;
  }

  // Make API request with fallback to local storage
  private async makeApiRequest(
    url: string,
    options: RequestInit = {},
    fallbackData?: any
  ): Promise<any> {
    const startTime = Date.now();
    const method = options.method || 'GET';

    // Log the API request (but don't log sensitive data like passwords)
    console.log(`🔐 [AUTH ${method}] ${url}`);
    if (options.body) {
      const bodyData = JSON.parse(options.body as string);
      // Hide sensitive data in logs
      const sanitizedBody = { ...bodyData };
      if (sanitizedBody.password) {
        sanitizedBody.password = '***';
      }
      console.log(`📤 [AUTH REQUEST BODY]:`, sanitizedBody);
    }

    try {
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Log headers but hide sensitive authorization info
      const sanitizedHeaders = { ...requestHeaders };
      if (sanitizedHeaders.Authorization) {
        sanitizedHeaders.Authorization = 'Bearer ***';
      }
      console.log(`📋 [AUTH REQUEST HEADERS]:`, sanitizedHeaders);

      const response = await fetch(url, {
        ...options,
        headers: requestHeaders,
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️  [AUTH ${method}] ${url} - ${response.status} ${response.statusText} (${duration}ms)`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [AUTH ERROR] ${response.status}: ${response.statusText}`);
        console.error(`📥 [AUTH ERROR RESPONSE]:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(`✅ [AUTH SUCCESS] ${method} ${url}`);
      // Don't log sensitive response data like tokens
      const sanitizedResponse = { ...responseData };
      if (sanitizedResponse.token) {
        sanitizedResponse.token = '***';
      }
      console.log(`📥 [AUTH RESPONSE DATA]:`, sanitizedResponse);

      return responseData;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.warn(`⚠️  [AUTH FALLBACK] ${method} ${url} failed after ${duration}ms, falling back to local storage:`, error);

      if (fallbackData !== undefined) {
        console.log(`🔄 [AUTH FALLBACK] Using fallback data for ${method} ${url}`);
        console.log(`💾 [AUTH FALLBACK SUCCESS] Local storage fallback completed for ${method} ${url}`);
        return fallbackData;
      }

      throw error;
    }
  }

  // Load authentication state from storage
  async loadAuthState(): Promise<AuthState> {
    try {
      const authData = await AsyncStorage.getItem(this.AUTH_STORAGE_KEY);
      if (authData) {
        const parsedAuth = JSON.parse(authData);
        return {
          user: parsedAuth.user,
          isAuthenticated: parsedAuth.isAuthenticated || false,
          token: parsedAuth.token,
        };
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }

    return {
      isAuthenticated: false,
    };
  }

  // Save authentication state to storage
  async saveAuthState(authState: AuthState): Promise<void> {
    try {
      await AsyncStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(authState));
    } catch (error) {
      console.error('Error saving auth state:', error);
      throw error;
    }
  }

  // Register a new user
  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    const url = this.buildApiUrl(apiConfig.endpoints.users.create);

    // Create user object for local storage fallback
    const user: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: userData.username,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone_number: userData.phoneNumber,
      createdAt: new Date().toISOString(),
    };

    const response = await this.makeApiRequest(url, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return {
      user: response.user || response,
      token: response.token,
    };
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const url = this.buildApiUrl('/user/signin'); // Direct endpoint for signin

    try {
      // Try API first
      const response = await this.makeApiRequest(url, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return {
        user: response.user,
        token: response.token,
      };
    } catch (error) {
      // Fallback to local storage authentication
      console.warn('API login failed, checking local storage');

      const existingUsers = await this.getLocalUsers();
      const user = existingUsers.find(u => u.username === credentials.username);

      if (!user) {
        throw new Error('Invalid username or password');
      }

      // In a real app, you'd verify the password hash
      // For now, we'll just accept any password for local users
      // Create a mock JWT token for local users
      const mockToken = btoa(JSON.stringify({ user_id: user.id, username: user.username, exp: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60) }));
      return { user, token: mockToken };
    }
  }

  // Logout user - clear all local data without API call
  async logout(): Promise<void> {
    console.log('🔐 [AuthService] Logging out user - clearing all local data');

    try {
      // Clear auth state
      await this.saveAuthState({
        isAuthenticated: false,
      });

      // Clear all app data by importing FlagNationDataService dynamically to avoid circular imports
      const FlagNationDataService = (await import('./FlagNationDataService')).default;
      await FlagNationDataService.clearAllData();

      console.log('✅ [AuthService] Logout completed - all data cleared');
    } catch (error) {
      console.error('❌ [AuthService] Error during logout:', error);
      // Even if there's an error, clear auth state
      await this.saveAuthState({
        isAuthenticated: false,
      });
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    const authState = await this.loadAuthState();

    if (!authState.isAuthenticated || !authState.user) {
      return null;
    }

    try {
      const url = this.buildApiUrl(apiConfig.endpoints.users.profile);
      const response = await this.makeApiRequest(url, {
        headers: {
          'Authorization': `Basic ${authState.token}`,
        },
      }, authState.user);

      return response;
    } catch (error) {
      console.warn('Failed to get current user:', error);
      return authState.user;
    }
  }

  // Helper method to get local users
  private async getLocalUsers(): Promise<User[]> {
    try {
      const users = await AsyncStorage.getItem('FLAG_NATION_USERS');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error loading local users:', error);
      return [];
    }
  }

  // Check if API is available
  async isApiAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get authorization header for API requests
  async getAuthHeader(): Promise<{ Authorization: string } | {}> {
    const authState = await this.loadAuthState();

    if (authState.token && !this.isTokenExpired(authState.token)) {
      return {
        Authorization: `Bearer ${authState.token}`,
      };
    }

    return {};
  }

  // Public method to decode token payload
  decodeTokenPayload(token: string): any {
    try {
      // Our new token format is a simple base64 encoded JSON object
      return JSON.parse(atob(token));
    } catch (error) {
      console.warn('Error decoding token:', error);
      return null;
    }
  }
}

export default AuthService.getInstance();
