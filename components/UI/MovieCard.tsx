import { memo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
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
    : { uri: 'https://via.placeholder.com/300x450/1f2937/9ca3af?text=No+Poster' };

  return (
    <View style={styles.container}>
      <Image 
        source={posterSource}
        style={styles.poster}
        resizeMode="cover"
      />
      
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="light" style={styles.glassContainer}>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {movie.Title}
            </Text>
            
            <View style={styles.metadata}>
              <View style={styles.yearBadge}>
                <Text style={styles.year}>{movie.Year}</Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.type}>{movie.Type}</Text>
              </View>
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
              size={24}
              color={isInWatchlist ? '#ef4444' : '#ffffff'}
            />
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
});

MovieCard.displayName = 'MovieCard';

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  poster: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1f2937',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  glassContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  info: {
    padding: 14,
    paddingRight: 60,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 22,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  year: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  typeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  type: {
    fontSize: 11,
    color: '#ffffff',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default MovieCard;