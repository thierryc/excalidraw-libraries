import React from 'react';
import { Library } from '../types';
import { formatDate } from '../utils/dates';

interface LibraryCardProps {
  library: Library;
  referrer: string;
  target: string;
  appName: string;
  csrfToken?: string;
  useHash?: boolean;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({
  library,
  referrer,
  target,
  appName,
  csrfToken,
  useHash
}) => {
  const origin = window.location.origin;
  const libraryUrl = encodeURIComponent(`${origin}/libraries/${library.source}`);
  const addToLibUrl = `${referrer}${useHash ? '#' : '?'}addLibrary=${libraryUrl}${
    csrfToken ? `&token=${csrfToken}` : ''
  }`;

  return (
    <div className="library" id={library.id} data-version={library.version || '1'}>
      <h2>{library.name}</h2>
      <div className="preview">
        <img
          className="lazy"
          data-src={`libraries/${library.preview}?v=${library.updated}`}
          alt={`Preview of ${library.name}`}
        />
      </div>
      <div className="description">
        <p>{library.description}</p>
        {library.itemNames && (
          <p>
            <b>Items: </b>
            <span className="itemNames">
              {library.itemNames.length > 300
                ? library.itemNames.slice(0, 300).join(', ') + '...'
                : library.itemNames.join(', ')}
            </span>
          </p>
        )}
      </div>
      <div className="authors">
        {library.authors.map((author) => (
          <a key={author.name} href={author.url} target="_blank" rel="noopener noreferrer">
            @{author.name}
          </a>
        ))}
      </div>
      <div className="dates">
        <p className="created">Created: {formatDate(library.created)}</p>
        {library.created !== library.updated && (
          <p className="updated">Updated: {formatDate(library.updated)}</p>
        )}
      </div>
      <div className="downloads">
        <p>Downloads: {library.downloads.total} (This week: {library.downloads.week})</p>
      </div>
      <div className="actions">
        <a
          href={addToLibUrl}
          target={target}
          className="install-library"
          rel="noopener noreferrer"
        >
          Add to {appName}
        </a>
      </div>
    </div>
  );
};