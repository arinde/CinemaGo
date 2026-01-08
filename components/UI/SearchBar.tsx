import { useState, useCallback, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search movies...', 
  debounceMs = 500 
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't search for empty or very short queries
    if (query.trim().length < 3) {
      if (query.trim().length === 0) {
        onSearch('Marvel'); // Reset to default
      }
      return;
    }

    // Debounce the search
    timeoutRef.current = setTimeout(() => {
      onSearch(query.trim());
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, onSearch, debounceMs]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('Marvel'); // Reset to default
  }, [onSearch]);

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#9ca3af" style={styles.icon} />
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />

      {query.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;