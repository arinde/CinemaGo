# CinemaGo - Movie Discovery & Watchlist App

A modern React Native mobile application built with Expo that allows users to discover movies and manage a persistent watchlist.

## 📱 Features

- 🎬 **Movie Discovery**: Browse movies with random category refresh
- 🔍 **Smart Search**: Debounced search with minimum 3 characters
- 💾 **Persistent Watchlist**: Movies saved locally using AsyncStorage
- 🔄 **Pull-to-Refresh**: Get different movie categories on each refresh
- ⚡ **Optimistic UI**: Instant feedback when adding/removing movies
- 🌙 **Dark Theme**: Cohesive dark UI throughout the entire app
- 📱 **Tab Navigation**: Seamless switching between Discover and Watchlist

## 🚀 How to Run the Project

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator / Physical device with Expo Go app

### Installation Steps

1. **Clone the repository**
On your vs code terminal or cmd 
```bash
git clone https://github.com/arinde/CinemaGo.git
cd CinemaGo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```bash
EXPO_PUBLIC_OMDB_API_KEY=your_api_key_here
```

Get your free API key from: https://www.omdbapi.com/apikey.aspx
- Select FREE plan (1,000 requests/day)
- Check your email and click the activation link
- Copy your API key to the `.env` file

4. **Install required package for glassmorphic effect**
```bash
npx expo install expo-blur
```

5. **Start the development server**
```bash
npx expo start
```

Or clear cache if needed:
```bash
npx expo start -c
```

6. **Run on your device**
- **iOS**: Press `i` or scan QR code with Camera app (Download the Expo Go app on ios to run)
- **Android**: Press `a` or scan QR code with Expo Go app
- **Web**: Press `w` (limited functionality)

## 📁 Project Structure

```
CinemaGo/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Browse/Discover screen
│   │   └── watchlist.tsx         # Watchlist screen
│   ├── _layout.tsx               # Root layout with splash screen
│   ├── _loading.tsx              # Global loading screen
│   └── +not-found.tsx            # 404 error screen
│
├── components/                   # Reusable UI components
│   ├── MovieCard.tsx             # Glassmorphic movie card
│   ├── SearchBar.tsx             # Search input with debouncing
│   ├── EmptyState.tsx            # Empty state component
│   └── LoadingSpinner.tsx        # Loading indicator
│
├── hooks/                        # Custom React hooks
│   ├── useMovies.ts              # Movie fetching and search logic
│   └── useWatchlist.ts           # Watchlist state management
│
├── services/                     # External services
│   ├── api.ts                    # OMDb API integration
│   └── storage.ts                # AsyncStorage wrapper
│
├── types/                        # TypeScript definitions
│   └── movie.ts                  # Movie interface
│
├── global.css                    # NativeWind global styles
├── .env                          # Environment variables (not committed)
└── README.md                     # This file
```

## 🏗️ Architectural Decisions

### 1. **File-Based Routing (Expo Router 6)**

**Decision**: Use Expo Router for navigation instead of React Navigation manually.

**Why**:
- Automatic deep linking and URL support
- File-system based routing (similar to Next.js)
- Type-safe navigation
- Reduced boilerplate code
- Built-in tab navigation support

**Structure**:
```
(tabs)/          ← Parentheses create route groups
  ├── index.tsx  ← Maps to "/" (Discover tab)
  └── watchlist.tsx  ← Maps to "/watchlist"
```

### 2. **State Management: Custom Hooks**

**Decision**: Use custom React hooks instead of Redux, Zustand, or Context API.

**Why**:
- App state is simple and localized to each screen
- No need for global state management overhead
- Custom hooks provide perfect abstraction for this use case
- Easy to test and maintain
- No prop drilling issues

**Hook Architecture**:
```typescript
useMovies()      → Manages movie search and fetching
useWatchlist()   → Manages watchlist CRUD operations
```

Each screen creates its own hook instance. The Watchlist screen uses `useFocusEffect` to refresh data from AsyncStorage when the tab becomes active, ensuring data stays synchronized.

### 3. **Component Organization**

**Decision**: Separate components by responsibility, not by feature.

**Structure**:
- `components/` - Reusable UI components (MovieCard, SearchBar)
- `hooks/` - Business logic (useMovies, useWatchlist)
- `services/` - External APIs and storage (api.ts, storage.ts)

**Why**:
- Clear separation of concerns
- Easy to locate and modify code
- Components are reusable across screens
- Business logic separated from UI

### 4. **TypeScript for Type Safety**

**Decision**: Full TypeScript implementation with strict mode enabled.

**Why**:
- Compile-time error detection
- Better IDE autocomplete and IntelliSense
- Self-documenting code
- Easier refactoring
- Prevents common runtime errors

**Key Types**:
```typescript
interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}
```


## 💾 Persistent Storage Logic

### Overview

The app uses AsyncStorage to persist the watchlist across app restarts. The storage implementation includes optimistic updates, error rollback, and data versioning.

### Storage Architecture

#### 1. **Storage Service Wrapper** (`services/storage.ts`)

Created a clean API wrapper around AsyncStorage:

```typescript
export const storage = {
  getWatchlist(): Promise<Movie[]>
  saveWatchlist(movies: Movie[]): Promise<void>
  addToWatchlist(movie: Movie): Promise<void>
  removeFromWatchlist(id: string): Promise<void>
  clearWatchlist(): Promise<void>
}
```

**Benefits**:
- Single source of truth for all storage operations
- Type-safe operations with TypeScript
- Centralized error handling
- Easy to swap storage provider in the future (e.g., to SQLite)
- Abstraction allows for testing without actual storage

#### 2. **Data Structure**

```typescript
// AsyncStorage Key
const WATCHLIST_KEY = '@cinemago_watchlist';

// Stored Data Format
interface StorageData {
  version: string;        // For future migrations
  watchlist: Movie[];     // Array of saved movies
  lastUpdated: number;    // Timestamp
}
```

**Storage Format**:
```json
{
  "version": "1.0",
  "watchlist": [
    {
      "imdbID": "tt0848228",
      "Title": "The Avengers",
      "Year": "2012",
      "Type": "movie",
      "Poster": "https://..."
    }
  ],
  "lastUpdated": 1704729600000
}
```

#### 3. **Read Operation (On App Start)**

```typescript
useEffect(() => {
  const loadWatchlist = async () => {
    try {
      const savedWatchlist = await storage.getWatchlist();
      setWatchlist(savedWatchlist); // Restore state
    } catch (error) {
      setWatchlist([]); // Fallback to empty
    }
  };
  loadWatchlist();
}, []);
```

#### 4. **Write Operations with Optimistic Updates**

**Optimistic UI Pattern**:
```typescript
const addToWatchlist = async (movie: Movie) => {
  const previousState = watchlist;
  
  // 1. Update UI immediately (optimistic)
  setWatchlist(prev => [...prev, movie]);
  
  try {
    // 2. Persist to storage (async)
    await storage.addToWatchlist(movie);
  } catch (error) {
    // 3. Rollback on failure
    setWatchlist(previousState);
    throw error;
  }
};
```

**Why Optimistic Updates?**:
- Instant user feedback (no waiting for async operations)
- Better perceived performance
- Automatic rollback maintains data integrity

#### 5. **Tab Synchronization**

**Problem**: Each screen has its own `useWatchlist` instance, so they don't share state in real-time.

**Solution**: Use `useFocusEffect` to refresh watchlist from AsyncStorage when the Watchlist tab becomes active:

```typescript
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  useCallback(() => {
    refreshWatchlist(); // Reload from AsyncStorage
  }, [refreshWatchlist])
);
```

**Flow**:
1. User adds movie in Browse tab
2. `useWatchlist` updates state and saves to AsyncStorage
3. User switches to Watchlist tab
4. `useFocusEffect` triggers
5. `refreshWatchlist()` loads fresh data from AsyncStorage
6. Watchlist displays updated list

#### 6. **Data Validation and Error Handling**

```typescript
// Validate data structure
if (!Array.isArray(data.watchlist)) {
  console.warn('Invalid data, resetting');
  return [];
}

// Handle corrupted data
try {
  const data = JSON.parse(jsonValue);
} catch (error) {
  if (error instanceof SyntaxError) {
    await this.clearWatchlist(); // Reset corrupted data
  }
  return [];
}
```

#### 7. **Storage Features**

- ✅ **Versioning**: Track storage schema version for future migrations
- ✅ **Metadata**: Store lastUpdated timestamp
- ✅ **Size Monitoring**: Warn if approaching AsyncStorage limits (6MB)
- ✅ **Data Validation**: Validate movie objects before saving
- ✅ **Duplicate Prevention**: Check before adding duplicate movies
- ✅ **Export/Import**: JSON export for backup/sharing
- ✅ **Error Recovery**: Automatic handling of corrupted data

#### 8. **Persistence Guarantee**

AsyncStorage ensures:
- **Atomic writes**: Operation completes fully or not at all
- **Durability**: Data survives app restart, force close, and device reboot
- **Thread-safe**: Multiple operations won't corrupt data

**Testing Persistence**:
1. Add movies to watchlist
2. Force close the app (swipe up in app switcher)
3. Reopen the app
4. Navigate to Watchlist tab
5. ✅ All movies are still there

### Why AsyncStorage Over Alternatives?

| Solution | Pros | Cons | Verdict |
|----------|------|------|---------|
| **AsyncStorage** | Built-in, simple API, persistent, async | String-only storage | ✅ Perfect for this use case |
| SQLite | Relational queries, large datasets | Complex setup, overkill | ❌ Unnecessary complexity |
| Expo SecureStore | Encrypted, secure | 2KB limit, for sensitive data only | ❌ Wrong tool for this |
| MMKV | Faster than AsyncStorage | Extra dependency | ❌ Premature optimization |


### Smart Movie Rotation

Instead of always showing "Marvel" movies, the app:
- Picks a random starting category from 70+ options
- Rotates through unused categories on refresh
- Resets after using 80% of categories
- Ensures variety without repeats

## 🧪 Testing

### Manual Testing Checklist

**Browse Screen**:
- [ ] Movies display with posters, titles, years
- [ ] Search works (min 3 characters)
- [ ] Pull-to-refresh shows different movies
- [ ] Heart icon toggles immediately
- [ ] Search is debounced (500ms)

**Watchlist Screen**:
- [ ] Saved movies appear when switching tabs
- [ ] Can remove movies
- [ ] Empty state shows when no movies
- [ ] Clear all works with confirmation
- [ ] Movie count displays correctly

**Persistence** (Critical):
1. [ ] Add 5 movies to watchlist
2. [ ] Switch to Watchlist tab → all 5 appear
3. [ ] Force close app (swipe up)
4. [ ] Reopen app
5. [ ] Go to Watchlist tab
6. [ ] **All 5 movies still there** ✅

## 🛠️ Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Mobile framework |
| React | 19.1.0 | UI library |
| Expo SDK | ~54.0 | Development platform |
| Expo Router | ~6.0 | File-based routing |
| TypeScript | ~5.9 | Type safety |
| AsyncStorage | 2.2.0 | Local storage |
| Expo Blur | Latest | Glassmorphic effects |
| OMDb API | Free | Movie data source |

## 🐛 Troubleshooting

### Issue: "Invalid API Key" or 401 Error

**Solution**:
1. Verify `.env` file exists with correct format:
   ```
   EXPO_PUBLIC_OMDB_API_KEY=your_key_here
   ```
2. Check your email and click the activation link
3. Restart Expo: `npx expo start -c`

### Issue: Watchlist Not Updating

**Solution**:
- Switch away from Watchlist tab and back
- `useFocusEffect` will reload data from AsyncStorage
- Check console for storage errors

### Issue: Build Errors

**Solution**:
```bash
rm -rf node_modules .expo
npm install
npx expo start -c
```

## 📄 License

This project was created as a technical assessment for Tolamore Consulting.

## 👤 Author

Submission Date: Thursday, January 8th, 2026

---

**Built by Arinde Victor using Expo SDK 54 & React Native**