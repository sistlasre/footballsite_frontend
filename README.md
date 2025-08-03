# Flag Nation

Flag Nation is a cross-platform mobile application for iOS and Android that allows users to manage sports events and teams. It provides features for creating and participating in events, forming teams, and registering players.

## Features

### 🔖 Event Management
- **Create Events**: Organizers can create and manage events
- **Sub-Events**: Link events as sub-events to manage large tournaments
- **Event Registration**: Players can register for events with status tracking
- **Event Details**: View comprehensive event information including participants and teams

### 🏆 Team Management
- **Create Teams**: Users can form teams and join existing ones
- **Sub-Teams**: Create smaller units within teams for complex group structures
- **Team Profiles**: Detailed team information with member management
- **Team Registration**: Join teams through a streamlined registration process

### 👥 Player Management
- **Player Registrations**: Players can register for events and teams
- **Profiles**: Manage player profiles and track event participation
- **Registration Status**: Track pending, approved, and rejected registrations

### 📸 Media Integration
- **Image Capture**: Use device camera to capture team and event photos
- **Photo Library Access**: Save and retrieve images from device photo library

### 💾 Data Management
- **Offline Support**: Work offline with local data storage
- **AsyncStorage**: Persistent data storage across app sessions
- **API Integration**: Sync with backend services when online
- **Authentication**: Secure user authentication and authorization

### 🎨 User Interface
- **React Native UI**: Intuitive native interface elements
- **Dark/Light Mode**: Automatically adapt to system theme
- **Tabbed Navigation**: Easy navigation across different app sections
- **Role-based Views**: Different interfaces for players and organizers

## Technical Stack

- **Framework**: Expo with React Native
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Camera**: Expo Camera & Image Picker
- **Storage**: AsyncStorage
- **UI**: React Native with themed components
- **Icons**: Ionicons
- **Authentication**: JWT token-based authentication

## Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## Usage

### For Players
1. **Register/Login** - Create an account or sign in to access the app
2. **Browse Events** - View available events and their details
3. **Join Teams** - Find and join teams that match your interests
4. **Register for Events** - Sign up for events individually or as part of a team
5. **Track Registrations** - Monitor your registration status and manage your participation

### For Organizers
1. **Create Events** - Set up new events with detailed information
2. **Manage Teams** - Oversee team formation and participation
3. **Handle Registrations** - Review and approve player registrations
4. **Event Analytics** - View participant counts and event statistics

## App Structure

```
app/
├── (tabs)/           # Main tabbed interface
├── login.tsx         # Authentication screens
├── register.tsx      
├── events.tsx        # Event management
├── event/[eventId].tsx # Event details
├── team/[id].tsx     # Team details
└── player/           # Player-specific screens
    ├── events.tsx
    ├── teams.tsx
    └── registrations.tsx

services/
├── AuthService.ts           # Authentication management
└── FlagNationDataService.ts # Data operations and API calls

types/
└── index.ts          # TypeScript interfaces and types
```

## Camera Permissions

The app requires camera permissions to capture team and event photos. Permissions are requested automatically when accessing the camera for the first time.

## API Integration

To integrate with your backend service, update the API configuration in `config/api.json`. The app supports:
- User authentication
- Event CRUD operations
- Team management
- Player registrations
- Data synchronization

## Building for Production

```bash
eas build --platform ios      # iOS
eas build --platform android  # Android
```

## Development Notes

- The app functions offline using local storage
- Physical device testing is recommended for camera features
- Auth and API configurations can be adjusted in `services/FlagNationDataService.ts` and `config/api.json`
- The app uses a role-based interface that adapts based on user permissions
- All data operations include both local storage and API synchronization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## License

This project is private and proprietary.
