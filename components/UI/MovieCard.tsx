import { memo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Movie } from '@/types/movieTypes';
import { Ionicons } from '@expo/vector-icons';

interface MovieCardProps {
  movie: Movie;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

const MovieCard = memo<MovieCardProps>(({ movie, isInWatchlist, onToggleWatchlist }) => {
  const handlePress = useCallback(() => {
    onToggleWatchlist(movie);
  }, [movie, onToggleWatchlist]);

  const posterSource = movie.Poster !== 'N/A' 
    ? { uri: movie.Poster }
    : { uri: 'https://via.placeholder.com/300x450/e5e7eb/9ca3af?text=No+Poster' };

  return (
    <View style={styles.container}>
      <Image 
        source={posterSource}
        style={styles.poster}
        resizeMode="cover"
      />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.Title}
        </Text>
        <Text style={styles.year}>{movie.Year}</Text>
        <View style={styles.typeContainer}>
          <Text style={styles.type}>{movie.Type}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.heartButton}
        onPress={handlePress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isInWatchlist ? 'heart' : 'heart-outline'}
          size={28}
          color={isInWatchlist ? '#ef4444' : '#9ca3af'}
        />
      </TouchableOpacity>
    </View>
  );
});

MovieCard.displayName = 'MovieCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 22,
  },
  year: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  typeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  type: {
    fontSize: 12,
    color: '#374151',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  heartButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
});

export default MovieCard;