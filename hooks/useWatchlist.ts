import { useState, useEffect, useCallback } from 'react';
import { Movie } from '@/types/movieTypes';
import { storage } from '@/services/storage';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load watchlist from storage on mount
  useEffect(() => {
    let isMounted = true;

    const loadWatchlist = async () => {
      try {
        setLoading(true);
        setError(null);
        const savedWatchlist = await storage.getWatchlist();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setWatchlist(savedWatchlist);
        }
      } catch (err) {
        console.error('Error loading watchlist:', err);
        if (isMounted) {
          setError('Failed to load watchlist');
          setWatchlist([]); // Fallback to empty array
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWatchlist();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Check if a movie is in the watchlist
   */
  const isInWatchlist = useCallback((imdbID: string): boolean => {
    return watchlist.some(movie => movie.imdbID === imdbID);
  }, [watchlist]);

  /**
   * Add a movie to the watchlist with optimistic update
   */
  const addToWatchlist = useCallback(async (movie: Movie): Promise<void> => {
    // Check if already in watchlist
    if (watchlist.some(m => m.imdbID === movie.imdbID)) {
      return;
    }

    // Store previous state for rollback
    const previousWatchlist = watchlist;

    // Optimistic update - update UI immediately
    setWatchlist(prev => [...prev, movie]);
    setError(null);

    try {
      // Persist to storage
      await storage.addToWatchlist(movie);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
      
      // Rollback on error - revert to previous state
      setWatchlist(previousWatchlist);
      setError('Failed to add movie to watchlist');
      
      // Re-throw error so caller can handle it
      throw err;
    }
  }, [watchlist]);

  /**
   * Remove a movie from the watchlist with optimistic update
   */
  const removeFromWatchlist = useCallback(async (imdbID: string): Promise<void> => {
    // Store previous state for rollback
    const previousWatchlist = watchlist;

    // Optimistic update - update UI immediately
    setWatchlist(prev => prev.filter(movie => movie.imdbID !== imdbID));
    setError(null);

    try {
      // Persist to storage
      await storage.removeFromWatchlist(imdbID);
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
      
      // Rollback on error - revert to previous state
      setWatchlist(previousWatchlist);
      setError('Failed to remove movie from watchlist');
      
      // Re-throw error so caller can handle it
      throw err;
    }
  }, [watchlist]);

  /**
   * Clear the entire watchlist with optimistic update
   */
  const clearWatchlist = useCallback(async (): Promise<void> => {
    // Store previous state for rollback
    const previousWatchlist = watchlist;

    // Optimistic update - clear UI immediately
    setWatchlist([]);
    setError(null);

    try {
      // Persist to storage
      await storage.clearWatchlist();
    } catch (err) {
      console.error('Failed to clear watchlist:', err);
      
      // Rollback on error - revert to previous state
      setWatchlist(previousWatchlist);
      setError('Failed to clear watchlist');
      
      // Re-throw error so caller can handle it
      throw err;
    }
  }, [watchlist]);

  /**
   * Refresh watchlist from storage (useful after errors)
   */
  const refreshWatchlist = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const savedWatchlist = await storage.getWatchlist();
      setWatchlist(savedWatchlist);
    } catch (err) {
      console.error('Error refreshing watchlist:', err);
      setError('Failed to refresh watchlist');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    watchlist,
    loading,
    error,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    clearWatchlist,
    refreshWatchlist,
  };
};