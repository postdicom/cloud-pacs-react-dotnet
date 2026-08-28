import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../queryClientProvider';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value); // only runs if 'delay' ms pass without a new render
    }, delay);

    return () => clearTimeout(timer); // cleanup: cancel timer if value changes again
  }, [value, delay]); // re-runs every time 'value' changes

  return debouncedValue;
}

// Usage in SearchBar component:
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);

// This useQuery only fires when debouncedQuery changes (after 300ms pause)
const { data } = useQuery({
  queryKey: ['search', debouncedQuery],
  queryFn: () => api.get(`/api/v1/search?q=${debouncedQuery}`).then(r => r.data),
  enabled: debouncedQuery.length > 2, // don't search on 1–2 chars
});