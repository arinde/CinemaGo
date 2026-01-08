import { useState, useEffect, useCallback, useRef } from 'react';
import { Movie } from '@/types/movieTypes';
import { api } from '@/services/api';

const SEARCH_TERMS = [
  'Avengers', 'Batman', 'Superman', 'Spider-Man', 'Iron Man',
  'Thor', 'Captain America', 'Black Panther', 'Wonder Woman',
  'Justice League', 'X-Men', 'Deadpool', 'Guardians',
  'Star Wars', 'Star Trek', 'Lord of the Rings', 'Harry Potter',
  'Matrix', 'Jurassic', 'Terminator', 'Alien', 'Predator',
  'James Bond', 'Mission Impossible', 'Fast Furious', 'John Wick',
  'Bourne', 'Die Hard', 'Mad Max', 'Rambo', 'Rocky',
  'Toy Story', 'Shrek', 'Frozen', 'Minions', 'Despicable',
  'Finding', 'Incredibles', 'Cars', 'Up', 'Wall-E',
  'Halloween', 'Friday', 'Nightmare', 'Scream', 'Saw',
  'Conjuring', 'Insidious', 'Paranormal', 'Ring',
  'Hangover', 'Anchorman', 'Step Brothers', 'Bridesmaids',
  'Superbad', 'Dumb', 'Ace Ventura', 'Austin Powers',
  'Titanic', 'Notebook', 'Love Actually', 'Before Sunrise',
  'Godfather', 'Goodfellas', 'Scarface', 'Casino',
  'Blade Runner', 'Inception', 'Interstellar', 'Avatar',
  'Back to the Future', 'Men in Black', 'Independence',
  'Pirates', 'Twilight', 'Hunger Games', 'Divergent',
  'Maze Runner', 'Transformers', 'Godzilla', 'King Kong'
];

export const useMovies = (initialQuery: string = 'Batman') => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>(initialQuery);
  
  const usedQueries = useRef<Set<string>>(new Set());
  const abortController = useRef<AbortController | null>(null);
  const isMounted = useRef(false);

  const fetchMovies = useCallback(async (searchQuery: string, signal?: AbortSignal) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.searchMovies(searchQuery, signal);

      if (signal?.aborted) return;

      if (response.Response === 'True' && response.Search) {
        setMovies(response.Search);
        setQuery(searchQuery);
        setError(null);
      } else {
        setMovies([]);
        setError(response.Error || 'No movies found');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      
      setMovies([]);
      setError('Failed to fetch movies. Please check your connection.');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const searchMovies = useCallback((searchQuery: string) => {
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    fetchMovies(searchQuery, abortController.current.signal);
  }, [fetchMovies]);

  const refreshMovies = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    
    
    if (usedQueries.current.size >= SEARCH_TERMS.length * 0.8) {
      usedQueries.current.clear();
    }

    // get unused term
    const unused = SEARCH_TERMS.filter(term => !usedQueries.current.has(term));
    const available = unused.length > 0 ? unused : SEARCH_TERMS;
    const randomTerm = available[Math.floor(Math.random() * available.length)];
    
    usedQueries.current.add(randomTerm);
    
    fetchMovies(randomTerm, abortController.current.signal);
  }, [fetchMovies]);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    // pick random starting term
    const randomIndex = Math.floor(Math.random() * SEARCH_TERMS.length);
    const startTerm = SEARCH_TERMS[randomIndex];
    usedQueries.current.add(startTerm);
    
    abortController.current = new AbortController();
    fetchMovies(startTerm, abortController.current.signal);

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchMovies]);

  return {
    movies,
    loading,
    error,
    searchMovies,
    refreshMovies,
    query,
  };
};