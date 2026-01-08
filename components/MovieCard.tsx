import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Movie } from '@/types/movieTypes';
import { Ionicons } from '@expo/vector-icons';

interface MovieCardProps {
  movie: Movie;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = memo(({ movie, isInWatchlist, onToggleWatchlist }) => {
  const posterSource = movie.Poster !== 'N/A' 
    ? { uri: movie.Poster }
    : require('@/assets/images/placeholder.png');

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
        <Text style={styles.type}>{movie.Type}</Text>
      </View>

      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => onToggleWatchlist(movie)}
        activeOpacity={0.7}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  year: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  heartButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
});

export default MovieCard;