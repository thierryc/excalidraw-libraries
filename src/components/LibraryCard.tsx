import React, { useEffect, useRef } from 'react';
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
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imgRef.current) {
            const img = imgRef.current;
            const dataSrc = img.getAttribute('data-src');
            
            if (dataSrc) {
              img.src = dataSrc;
              img.classList.remove('lazy');
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const origin = window.location.origin;
  const downlaodLib = `${origin}/libraries/${library.source}`;
  const libraryUrl = encodeURIComponent(downlaodLib);
  const addToLibUrl = `${referrer}${useHash ? '#' : '?'}addLibrary=${libraryUrl}${
    csrfToken ? `&token=${csrfToken}` : ''
  }`;

  

  return (
    <div className="library" id={library.id} data-version={library.version || '1'}>
      <h2>{library.name}</h2>
      <div className="preview">
        <img
          ref={imgRef}
          className="lazy"
          data-src={`libraries/${library.preview}?v=${library.updated}`}
          alt={`Preview of ${library.name}`}
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // Transparent placeholder
        />
      </div>
      <div className="description">
        <p>{library.description}</p>

        {library.itemNames && (
          <p className='itemNames'>
            <b>{`${library.itemNames.length}`} Items: </b>
            <span className="itemNames">
              {library.itemNames.length > 24
                ? library.itemNames.slice(0, 24).join(', ') + '…'
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
      <div className="actions">
        <a
          href={addToLibUrl}
          target={target}
          className="install-library"
          rel="noopener noreferrer"
        >
          Add to {appName}
        </a>
        <a 
          href={downlaodLib} 
          download={library.source}
          className="download-library" 
        >Download Library</a>
      </div>
    </div>
  );
};

export default LibraryCard;