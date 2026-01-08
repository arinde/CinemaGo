import { OMDbSearchResponse } from '@/types/movieTypes';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.omdbApiKey || process.env.EXPO_PUBLIC_OMDB_API_KEY;
const BASE_URL = 'https://www.omdbapi.com/';

const cache = new Map<string, { data: OMDbSearchResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

export const api = {
  async searchMovies(query: string, signal?: AbortSignal): Promise<OMDbSearchResponse> {
    try {
      if (!API_KEY) {
        throw new Error('OMDb API key is not configured. Please add it to your .env file.');
      }

      const cacheKey = `search_${query}`;
      
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 Using cached data for:', query);
        return cached.data;
      }

      console.log('🌐 Fetching fresh data for:', query);
      const url = `${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`;
      const response = await fetch(url, { signal });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your .env file and ensure the key is activated.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OMDbSearchResponse = await response.json();
      
      if (data.Response === 'True') {
        cache.set(cacheKey, { data, timestamp: Date.now() });
        //console.log('✅ Data cached for:', query);
      }

      return data;
    } catch (error) {
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  
  async getMovieById(imdbID: string, signal?: AbortSignal): Promise<any> {
    try {
      if (!API_KEY) {
        throw new Error('OMDb API key is not configured. Please add it to your .env file.');
      }

      const cacheKey = `movie_${imdbID}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const url = `${BASE_URL}?i=${imdbID}&apikey=${API_KEY}`;
      const response = await fetch(url, { signal });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your .env file and ensure the key is activated.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Response === 'True') {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  clearCache() {
    cache.clear();
    //console.log('🗑️ Cache cleared');
  },

  clearCacheEntry(key: string) {
    cache.delete(key);
    //console.log('🗑️ Cache entry cleared:', key);
  },

  getCacheStats() {
    return {
      size: cache.size,
      entries: Array.from(cache.keys()),
    };
  }
};