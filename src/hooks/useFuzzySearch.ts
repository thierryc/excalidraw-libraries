import { useState, useMemo, useCallback } from 'react';
import { Library } from '../types';
import Fuse, { IFuseOptions, FuseResult } from 'fuse.js';

// Define options type for the useFuzzySearch hook
interface FuzzySearchOptions extends IFuseOptions<Library> {
  debounceMs?: number;
}

// Interface for highlighted content
interface HighlightedContent {
  original: string;
  highlighted: string;
}

// Interface for search results with highlighting
interface HighlightedLibrary extends Library {
  highlights?: {
    name?: HighlightedContent;
    description?: HighlightedContent;
    itemNames?: HighlightedContent[];
  };
}

/**
 * Utility function to highlight matched text
 * @param text Original text
 * @param searchTerms Array of search terms to highlight
 * @returns Object containing original and highlighted text
 */
const highlightText = (text: string, searchTerms: string[]): HighlightedContent => {
  let highlighted = text;
  
  searchTerms.forEach(term => {
    if (!term.trim()) return;
    
    const regex = new RegExp(`(${term.trim()})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });

  return {
    original: text,
    highlighted
  };
};

/**
 * Custom hook for fuzzy searching through libraries with highlighting
 * Supports multi-word search with reactive input
 * @param libraries - Array of library objects to search through
 * @param options - Optional Fuse.js configuration options
 * @returns Object containing search state and handlers
 */
const useFuzzySearch = (
  libraries: Library[],
  options: FuzzySearchOptions = {},
) => {
  const [query, setQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<HighlightedLibrary[]>(libraries);
  const minMatchCharLength = 2;

  // Create memoized Fuse instance
  const fuse = useMemo(() => {
    const searchableLibraries = libraries.map((library) => ({
      ...library
    }));

    const defaultOptions = {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.2 },
        { name: 'itemNames', weight: 0.3 }
      ],
      threshold: 0.3,
      ignoreLocation: true,
      useExtendedSearch: true,
      includeScore: true,
      minMatchCharLength,
      shouldSort: true,
      ...options
    };

    return new Fuse(searchableLibraries, defaultOptions);
  }, [libraries, options]);

  // Perform search with highlighting
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery) {
      setSearchResults(libraries);
      return;
    }

    const searchTerms = searchQuery.split(' ').filter(term => term.trim().length > 0);
    const searchPattern = searchTerms.map(term => `'${term}`).join(' ');
    const results: FuseResult<Library>[] = fuse.search(searchPattern);

    if (searchQuery.length >= minMatchCharLength) {
        // Add highlighting to search results
    const highlightedResults: HighlightedLibrary[] = results.map(result => {
        const item = result.item;
        return {
          ...item,
          highlights: {
            name: highlightText(item.name, searchTerms),
            description: highlightText(item.description, searchTerms),
            itemNames: item.itemNames?.map(name => highlightText(name, searchTerms))
          }
        };
      });
      setSearchResults(highlightedResults);
    } else {
        setSearchResults(results.map(result => result.item));
    }

    
  }, [fuse, libraries]);

  // Debounced search handler
  const debouncedSearch = useCallback((value: string) => {
    const timeoutId = setTimeout(() => {
      performSearch(value);
    }, options.debounceMs || 300);
    return () => clearTimeout(timeoutId);
  }, [performSearch, options.debounceMs]);

  // Combined handler for updating query and triggering search
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  return {
    query,
    searchResults: searchResults.length > 0 ? searchResults : libraries,
    handleSearch,
    numberOfResults: searchResults.length,
    resetSearch: () => {
      setQuery('');
      setSearchResults(libraries);
    }
  };
};

export default useFuzzySearch;