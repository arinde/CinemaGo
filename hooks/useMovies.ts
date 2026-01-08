import { useState, useEffect, useCallback, useRef } from 'react';
import { Movie } from '@/types/movieTypes';
import { api } from '@/services/api';

export const useMovies = (initialQuery: string = 'Marvel') => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>(initialQuery);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMovies = useCallback(async (searchQuery: string, signal?: AbortSignal) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.searchMovies(searchQuery, signal);

      // Check if request was aborted
      if (signal?.aborted) {
        return;
      }

      if (response.Response === 'True' && response.Search) {
        setMovies(response.Search);
        setError(null);
      } else {
        setMovies([]);
        setError(response.Error || 'No movies found');
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      setMovies([]);
      setError('Failed to fetch movies. Please check your connection.');
      console.error('Error fetching movies:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const searchMovies = useCallback((searchQuery: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setQuery(searchQuery);
    fetchMovies(searchQuery, abortControllerRef.current.signal);
  }, [fetchMovies]);

  const refreshMovies = useCallback(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    fetchMovies(query, abortControllerRef.current.signal);
  }, [fetchMovies, query]);

  useEffect(() => {
    // Initial fetch
    abortControllerRef.current = new AbortController();
    fetchMovies(query, abortControllerRef.current.signal);

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Only run on mount

  return {
    movies,
    loading,
    error,
    searchMovies,
    refreshMovies,
    query
  };
};