import React, { useState, useEffect } from 'react';
import { Library, Stats, APP_NAMES } from './types';
import { sortBy } from './utils/sorting';
import { LibraryCard } from './components/LibraryCard';
import { SortControls } from './components/SortControls';
import { useImageLazyLoading } from './hooks/useImageLazyLoading';

const App: React.FC = () => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [currentSort, setCurrentSort] = useState<string>('default');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useImageLazyLoading();

  useEffect(() => {
    const fetchData = async () => {
      const [librariesRes, statsRes] = await Promise.all([
        fetch('/libraries.json'),
        fetch('/stats.json')
      ]);
      
      const librariesData = await librariesRes.json();
      const statsData: Stats = await statsRes.json();

      const processedLibraries = librariesData.map((library: Omit<Library, 'id' | 'downloads'>) => {
        const replaceText = { '/': '-', '.excalidrawlib': '' };
        const libraryId = library.source
          .toLowerCase()
          .replace(/\/|.excalidrawlib/g, (match) => replaceText[match as keyof typeof replaceText]);

        return {
          ...library,
          id: libraryId,
          downloads: {
            total: libraryId in statsData ? statsData[libraryId].total : 0,
            week: libraryId in statsData ? statsData[libraryId].week : 0,
          },
        };
      });

      setLibraries(sortBy[currentSort].func(processedLibraries));
    };

    fetchData();
  }, []);

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

  const filteredLibraries = libraries.filter((library) => {
    if (!filterQuery.trim()) return true;
    const query = filterQuery.toLowerCase();
    return (
      library.name.toLowerCase().includes(query) ||
      library.description.toLowerCase().includes(query) ||
      library.itemNames?.some((name) => name.toLowerCase().includes(query))
    );
  });

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
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Excalidraw Libraries</p>
      </footer>
    </div>
  );
};

export default App;