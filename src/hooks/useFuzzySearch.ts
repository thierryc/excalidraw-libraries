import { useState, useMemo, useCallback } from 'react';
import { Library } from '../types';
import Fuse from 'fuse.js';

/**
 * Custom hook for fuzzy searching through libraries
 * @param libraries - Array of library objects to search through
 * @param options - Optional Fuse.js configuration options
 * @returns Object containing search state and handlers
 */
const useFuzzySearch = (
    libraries: Library[],
    options: unknown,
) => {
    const [query, setQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Library[]>(libraries);

    // Create memoized Fuse instance
    const fuse = useMemo(() => {
        // Transform libraries to include itemNames as a searchable string
        const searchableLibraries = libraries.map((library: Library) => ({
            ...library
        }));

        // Default search configuration
        const defaultOptions = {
            keys: [
                { name: 'name', weight: 0.8 },
                { name: 'description', weight: 0.1 },
                { name: 'itemNames', weight: 0.3 }
            ],
            threshold: 0.4,
            includeScore: true,
            shouldSort: true,
            minMatchCharLength: 2,
            ...options
        };

        return new Fuse(searchableLibraries, defaultOptions);
    }, [libraries, options]);

    // Memoized search handler
    const handleSearch = useCallback((searchQuery: string) => {
        const trimmedQuery = searchQuery.trim();
        setQuery(trimmedQuery);

        if (!trimmedQuery) {
            setSearchResults(libraries);
            return;
        }

        const results = fuse.search(trimmedQuery);
        const mapedResult = results.map(result => result.item)
        setSearchResults(mapedResult);
    }, [fuse, libraries]);

    // Debounced search handler for better performance
    const debouncedSearch = useCallback((value: string) => {
        const timeoutId = setTimeout(() => {
            handleSearch(value);
        }, options.debounceMs || 300);

        return () => clearTimeout(timeoutId);
    }, [handleSearch, options.debounceMs]);

    console.log(searchResults);

    return {
        filterQuery: query,
        filteredLibraries: searchResults.length > 0 ? searchResults : libraries,
        handleSearch: debouncedSearch,
        setFilterQuery: (newQuery: string) => {
            setQuery(newQuery);
            debouncedSearch(newQuery);
        },
        resetSearch: () => {
            setQuery('');
            setSearchResults(libraries);
        }
    };
};

export default useFuzzySearch;