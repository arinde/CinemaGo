export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

export interface OMDbSearchResponse {
  Search?: Movie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

export interface WatchlistContextType {
  watchlist: Movie[];
  isInWatchlist: (imdbID: string) => boolean;
  addToWatchlist: (movie: Movie) => Promise<void>;
  removeFromWatchlist: (imdbID: string) => Promise<void>;
  loading: boolean;
}