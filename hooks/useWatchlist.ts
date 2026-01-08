import { useState, useEffect, useCallback } from 'react';
import { Movie } from '@/types/movieTypes';
import { storage } from '@/services/storage';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // this useEffect Loads watchlist from storage on mount
  useEffect(() => {
    let isMounted = true;

    const loadWatchlist = async () => {
      try {
        setLoading(true);
        setError(null);
        const savedWatchlist = await storage.getWatchlist();
        
        // used to update state if component is still mounted
        if (isMounted) {
          setWatchlist(savedWatchlist);
        }
      } catch (err) {
        console.error('Error loading watchlist:', err);
        if (isMounted) {
          setError('Failed to load watchlist');
          setWatchlist([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWatchlist();

    
    return () => {
      isMounted = false;
    };
  }, []);

  const isInWatchlist = useCallback((imdbID: string): boolean => {
    return watchlist.some(movie => movie.imdbID === imdbID);
  }, [watchlist]);

  const addToWatchlist = useCallback(async (movie: Movie): Promise<void> => {
    
    if (watchlist.some(m => m.imdbID === movie.imdbID)) {
      return;
    }

    
    const previousWatchlist = watchlist;

  
    setWatchlist(prev => [...prev, movie]);
    setError(null);

    try {
      
      await storage.addToWatchlist(movie);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
      
      
      setWatchlist(previousWatchlist);
      setError('Failed to add movie to watchlist');
      
      throw err;
    }
  }, [watchlist]);

  const removeFromWatchlist = useCallback(async (imdbID: string): Promise<void> => {
    
    const previousWatchlist = watchlist;

    setWatchlist(prev => prev.filter(movie => movie.imdbID !== imdbID));
    setError(null);

    try {
      await storage.removeFromWatchlist(imdbID);
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
      
      setWatchlist(previousWatchlist);
      setError('Failed to remove movie from watchlist');
      
      throw err;
    }
  }, [watchlist]);

  const clearWatchlist = useCallback(async (): Promise<void> => {
    
    const previousWatchlist = watchlist;

    setWatchlist([]);
    setError(null);

    try {
      await storage.clearWatchlist();
    } catch (err) {
      console.error('Failed to clear watchlist:', err);
      
      setWatchlist(previousWatchlist);
      setError('Failed to clear watchlist');
      
      throw err;
    }
  }, [watchlist]);

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