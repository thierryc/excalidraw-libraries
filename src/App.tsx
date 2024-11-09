import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Library, Stats, APP_NAMES } from './types';
import { sortBy } from './utils/sorting';
import { LibraryCard } from './components/LibraryCard';
import { SortControls } from './components/SortControls';
import useFuzzySearch from './hooks/useFuzzySearch';




const App: React.FC = () => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [currentSort, setCurrentSort] = useState<string>('default');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const {
    filterQuery,
    filteredLibraries,
    setFilterQuery,
    resetSearch
  } = useFuzzySearch(libraries, {
    debounceMs: 300,
    threshold: 0.4
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const librariesReader = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const decoder = useRef(new TextDecoder());
  const buffer = useRef('');


  const processLibrary = useCallback((library: Omit<Library, 'id' | 'downloads'>) => {
    const replaceText = { '/': '-', '.excalidrawlib': '' };
    const libraryId = library.source
      .toLowerCase()
      .replace(/\/|.excalidrawlib/g, (match) => replaceText[match as keyof typeof replaceText]);

    return {
      ...library,
      id: libraryId,
      downloads: {
        total: libraryId in stats ? stats[libraryId]?.total : 0,
        week: libraryId in stats ? stats[libraryId]?.week : 0,
      },
    };
  }, [stats]);

  const processJSONLChunk = async (reader: ReadableStreamDefaultReader<Uint8Array>, processLine: (line: any) => void) => {
    try {
      const { value, done } = await reader.read();
      if (done) {
        if (buffer.current) {
          const line = JSON.parse(buffer.current);
          processLine(line);
        }
        return true;
      }

      const chunk = decoder.current.decode(value, { stream: true });
      buffer.current += chunk;

      const lines = buffer.current.split('\n');
      buffer.current = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          const data = JSON.parse(line);
          processLine(data);
        }
      }
      return false;
    } catch (error) {
      console.error('Error processing JSONL chunk:', error);
      return true;
    }
  };

  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      if (!librariesReader.current) {
        const response = await fetch('/libraries.jsonl.json');
        const stream = response.body;
        if (!stream) throw new Error('No stream available');
        librariesReader.current = stream.getReader();
      }

      const done = await processJSONLChunk(librariesReader.current, (library) => {
        const processedLibrary = processLibrary(library);
        setLibraries(prev => sortBy[currentSort].func([...prev, processedLibrary]));
      });

      if (done) {
        setHasMore(false);
        librariesReader.current = null;
      }
    } catch (error) {
      console.error('Error loading libraries:', error);
      setHasMore(false);
    }

    setIsLoading(false);
  }, [isLoading, hasMore, currentSort, processLibrary]);

  // Load stats in the background
  // useEffect(() => {
  //   const loadStats = async () => {
  //     try {
  //       const response = await fetch('/stats.jsonl');
  //       const stream = response.body;
  //       if (!stream) throw new Error('No stream available');
  //       statsReader.current = stream.getReader();

  //       while (true) {
  //         const done = await processJSONLChunk(statsReader.current, (statData) => {
  //           setStats(prev => ({ ...prev, ...statData }));
  //         });
  //         if (done) break;
  //       }
  //     } catch (error) {
  //       console.error('Error loading stats:', error);
  //     }
  //   };

  //   loadStats();
  // }, []);

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreData();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreData]);

  const handleSort = (sortType: string) => {
    setCurrentSort(sortType);
    setLibraries(sortBy[sortType].func([...libraries]));
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('theme--dark');
  };

  const searchParams = new URLSearchParams(window.location.search);
  const referrer = searchParams.get('referrer') || 'https://excalidraw.com';
  const target = decodeURIComponent(searchParams.get('target') || '_blank');
  const useHash = searchParams.get('useHash') !== null;
  const csrfToken = searchParams.get('token');
  const appName = Object.entries(APP_NAMES).find(([, domain]) =>
    referrer.includes(domain)
  )?.[0] || 'Excalidraw';

  // const filteredLibraries = libraries.filter((library) => {
  //   if (!filterQuery.trim()) return true;
  //   const query = filterQuery.toLowerCase();
  //   return (
  //     library.name.toLowerCase().includes(query) ||
  //     library.description.toLowerCase().includes(query) ||
  //     library.itemNames?.some((name) => name.toLowerCase().includes(query))
  //   );
  // });

  return (
    <div className={`app ${theme}`}>
      <header>
        <div className="search-container">
          <input
            type="text"
            id="search-input"
            placeholder="Search libraries..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          <button
            onClick={resetSearch}
            className="ml-2 p-2 bg-gray-200 rounded"
          >
            Clear
          </button>
        </div>
        <button onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <SortControls currentSort={currentSort} onSort={handleSort} />
      </header>

      <main>
        <div className="libraries-grid">
          {filteredLibraries.map((library) => (
            <LibraryCard
              key={library.id}
              library={library}
              referrer={referrer}
              target={target}
              appName={appName}
              csrfToken={csrfToken || undefined}
              useHash={useHash}
            />
          ))}
        </div>
        <div ref={loadingRef} className="loading-indicator">
          {isLoading && <p>Loading more libraries...</p>}
          {!hasMore && <p>No more libraries to load</p>}
        </div>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Excalidraw Libraries</p>
      </footer>
    </div>
  );
};

export default App;