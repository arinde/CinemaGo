import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '@/types/movieTypes';

const WATCHLIST_KEY = '@cinemago_watchlist';
const STORAGE_VERSION = '1.0';
const VERSION_KEY = '@cinemago_version';

/**
 * Interface for stored data with versioning
 */
interface StorageData {
  version: string;
  watchlist: Movie[];
  lastUpdated: number;
}


export const storage = {
 
  async initialize(): Promise<void> {
    try {
      const version = await AsyncStorage.getItem(VERSION_KEY);
      
      if (!version) {
        await AsyncStorage.setItem(VERSION_KEY, STORAGE_VERSION);
        console.log('Storage initialized with version:', STORAGE_VERSION);
      } else if (version !== STORAGE_VERSION) {
        console.log('Storage migration from', version, 'to', STORAGE_VERSION);
        await AsyncStorage.setItem(VERSION_KEY, STORAGE_VERSION);
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  },

  
  async getWatchlist(): Promise<Movie[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(WATCHLIST_KEY);
      
      if (jsonValue === null) {
        return [];
      }

      const data: StorageData = JSON.parse(jsonValue);
      
      
      if (!Array.isArray(data.watchlist)) {
        console.warn('Invalid watchlist data structure, resetting');
        return [];
      }

      return data.watchlist;
    } catch (error) {
      console.error('Error reading watchlist from storage:', error);
      
      
      if (error instanceof SyntaxError) {
        console.warn('Corrupted data detected, clearing storage');
        await this.clearWatchlist();
      }
      
      return [];
    }
  },

  
  async saveWatchlist(watchlist: Movie[]): Promise<void> {
    try {
      
      if (!Array.isArray(watchlist)) {
        throw new Error('Watchlist must be an array');
      }

      const data: StorageData = {
        version: STORAGE_VERSION,
        watchlist: watchlist,
        lastUpdated: Date.now(),
      };

      const jsonValue = JSON.stringify(data);
      
      const sizeInBytes = new Blob([jsonValue]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 5) {
        console.warn('Watchlist size exceeds 5MB:', sizeInMB.toFixed(2), 'MB');
      }

      await AsyncStorage.setItem(WATCHLIST_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving watchlist to storage:', error);
      throw error;
    }
  },

  async addToWatchlist(movie: Movie): Promise<void> {
    try {
      
      if (!movie || !movie.imdbID) {
        throw new Error('Invalid movie object');
      }

      const watchlist = await this.getWatchlist();
      
      const exists = watchlist.some(m => m.imdbID === movie.imdbID);
      if (exists) {
        console.log('Movie already in watchlist:', movie.imdbID);
        return;
      }

      const updatedWatchlist = [...watchlist, movie];
      await this.saveWatchlist(updatedWatchlist);
      
      console.log('Added to watchlist:', movie.Title);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  },

  
  async removeFromWatchlist(imdbID: string): Promise<void> {
    try {
      
      if (!imdbID || typeof imdbID !== 'string') {
        throw new Error('Invalid imdbID');
      }

      const watchlist = await this.getWatchlist();
      
      const updatedWatchlist = watchlist.filter(m => m.imdbID !== imdbID);
      
      if (updatedWatchlist.length === watchlist.length) {
        console.log('Movie not found in watchlist:', imdbID);
        return;
      }

      await this.saveWatchlist(updatedWatchlist);
      
      console.log('Removed from watchlist:', imdbID);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },

  async isInWatchlist(imdbID: string): Promise<boolean> {
    try {
      const watchlist = await this.getWatchlist();
      return watchlist.some(m => m.imdbID === imdbID);
    } catch (error) {
      console.error('Error checking watchlist:', error);
      return false;
    }
  },

  async clearWatchlist(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WATCHLIST_KEY);
      console.log('Watchlist cleared');
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      throw error;
    }
  },

  async getMetadata(): Promise<{ count: number; lastUpdated: number | null; size: number }> {
    try {
      const jsonValue = await AsyncStorage.getItem(WATCHLIST_KEY);
      
      if (!jsonValue) {
        return { count: 0, lastUpdated: null, size: 0 };
      }

      const data: StorageData = JSON.parse(jsonValue);
      const sizeInBytes = new Blob([jsonValue]).size;

      return {
        count: data.watchlist.length,
        lastUpdated: data.lastUpdated,
        size: sizeInBytes,
      };
    } catch (error) {
      console.error('Error getting metadata:', error);
      return { count: 0, lastUpdated: null, size: 0 };
    }
  },

  async exportWatchlist(): Promise<string> {
    try {
      const watchlist = await this.getWatchlist();
      return JSON.stringify(watchlist, null, 2);
    } catch (error) {
      console.error('Error exporting watchlist:', error);
      throw error;
    }
  },

  async importWatchlist(jsonString: string, merge: boolean = false): Promise<void> {
    try {
      const importedMovies: Movie[] = JSON.parse(jsonString);
      
      if (!Array.isArray(importedMovies)) {
        throw new Error('Invalid import format');
      }

      const isValid = importedMovies.every(m => 
        m && typeof m === 'object' && m.imdbID && m.Title
      );
      
      if (!isValid) {
        throw new Error('Invalid movie data in import');
      }

      if (merge) {
        const existingWatchlist = await this.getWatchlist();
        const existingIds = new Set(existingWatchlist.map(m => m.imdbID));
        
        const newMovies = importedMovies.filter(m => !existingIds.has(m.imdbID));
        const mergedWatchlist = [...existingWatchlist, ...newMovies];
        
        await this.saveWatchlist(mergedWatchlist);
        console.log('Imported and merged', newMovies.length, 'new movies');
      } else {
        await this.saveWatchlist(importedMovies);
        console.log('Imported', importedMovies.length, 'movies');
      }
    } catch (error) {
      console.error('Error importing watchlist:', error);
      throw error;
    }
  },

 
  async getStorageStats(): Promise<{ used: number; limit: number; percentage: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);
      
      let totalSize = 0;
      allData.forEach(([key, value]) => {
        if (value) {
          totalSize += new Blob([value]).size;
        }
      });

      const limit = 6 * 1024 * 1024;
      const percentage = (totalSize / limit) * 100;

      return {
        used: totalSize,
        limit: limit,
        percentage: Math.round(percentage * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { used: 0, limit: 0, percentage: 0 };
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('All storage cleared');
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw error;
    }
  },
};