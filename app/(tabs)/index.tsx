import { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  ListRenderItem,
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
  const { movies, loading, error, searchMovies, refreshMovies } = useMovies();
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

  const ListHeaderComponent = useCallback(() => (
    <SearchBar onSearch={searchMovies} />
  ), [searchMovies]);

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title="No Results"
          message={error}
        />
      );
    }

    return (
      <EmptyState
        icon="film-outline"
        title="No Movies Found"
        message="Try searching for a different movie title"
      />
    );
  }, [loading, error]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          movies.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshMovies}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
});