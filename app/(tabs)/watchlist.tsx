import { useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ListRenderItem,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useWatchlist } from '@/hooks/useWatchlist';
import MovieCard from '@/components/UI/MovieCard';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import EmptyState from '@/components/UI/EmptyState';
import { Movie } from '@/types/movieTypes';

export default function WatchlistScreen() {
  const { 
    watchlist, 
    loading, 
    isInWatchlist, 
    removeFromWatchlist,
    clearWatchlist,
    refreshWatchlist
  } = useWatchlist();

  // Refresh watchlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshWatchlist();
    }, [refreshWatchlist])
  );

  const handleRemoveFromWatchlist = useCallback(async (movie: Movie) => {
    try {
      await removeFromWatchlist(movie.imdbID);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove movie from watchlist. Please try again.');
    }
  }, [removeFromWatchlist]);

  const handleClearWatchlist = useCallback(() => {
    if (watchlist.length === 0) return;

    Alert.alert(
      'Clear Watchlist',
      'Are you sure you want to remove all movies from your watchlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearWatchlist();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear watchlist. Please try again.');
            }
          },
        },
      ]
    );
  }, [watchlist.length, clearWatchlist]);

  const renderMovie: ListRenderItem<Movie> = useCallback(({ item }) => (
    <MovieCard
      movie={item}
      isInWatchlist={isInWatchlist(item.imdbID)}
      onToggleWatchlist={handleRemoveFromWatchlist}
    />
  ), [isInWatchlist, handleRemoveFromWatchlist]);

  const keyExtractor = useCallback((item: Movie) => item.imdbID, []);

  const ListHeaderComponent = useCallback(() => {
    if (watchlist.length === 0) return null;

    return (
      <View style={styles.header}>
        <Text style={styles.count}>
          {watchlist.length} {watchlist.length === 1 ? 'Movie' : 'Movies'}
        </Text>
        <TouchableOpacity 
          onPress={handleClearWatchlist} 
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  }, [watchlist.length, handleClearWatchlist]);

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return <LoadingSpinner />;
    }

    return (
      <EmptyState
        icon="bookmark-outline"
        title="No Movies Saved"
        message="Start adding movies to your watchlist from the Discover tab"
      />
    );
  }, [loading]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <FlatList
        data={watchlist}
        renderItem={renderMovie}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          watchlist.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 12,
    marginBottom: 8,
  },
  count: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
});