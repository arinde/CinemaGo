import { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  ListRenderItem,
  Text,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMovies } from '@/hooks/useMovies';
import { useWatchlist } from '@/hooks/useWatchlist';
import MovieCard from '@/components/UI/MovieCard';
import SearchBar from '@/components/UI/SearchBar';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import EmptyState from '@/components/UI/EmptyState';
import { Movie } from '@/types/movieTypes';

export default function BrowseScreen() {
  const { movies, loading, error, searchMovies, refreshMovies, query } = useMovies();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const handleToggleWatchlist = useCallback(async (movie: Movie) => {
    try {
      if (isInWatchlist(movie.imdbID)) {
        await removeFromWatchlist(movie.imdbID);
      } else {
        await addToWatchlist(movie);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update watchlist. Please try again.');
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  const renderMovie: ListRenderItem<Movie> = useCallback(({ item }) => (
    <MovieCard
      movie={item}
      isInWatchlist={isInWatchlist(item.imdbID)}
      onToggleWatchlist={handleToggleWatchlist}
    />
  ), [isInWatchlist, handleToggleWatchlist]);

  const keyExtractor = useCallback((item: Movie) => item.imdbID, []);

  if (loading && movies.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.headerSection}>
          <SearchBar onSearch={searchMovies} />
        </View>
        <LoadingSpinner />
      </View>
    );
  }

  if (error && movies.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.headerSection}>
          <SearchBar onSearch={searchMovies} />
        </View>
        <EmptyState
          icon="alert-circle-outline"
          title="No Results"
          message={error}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.headerSection}>
        <SearchBar onSearch={searchMovies} />
        
        {movies.length > 0 && (
          <View style={styles.infoBar}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{query}</Text>
            </View>
            <Text style={styles.resultsCount}>
              {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
            </Text>
          </View>
        )}
      </View>
      
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshMovies}
            tintColor="#ef4444"
            colors={['#ef4444']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  headerSection: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#111827',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#111827',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  categoryBadge: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsCount: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
});