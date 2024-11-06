import React from 'react';
import { sortBy } from '../utils/sorting';

interface SortControlsProps {
  currentSort: string;
  onSort: (sortType: string) => void;
}

export const SortControls: React.FC<SortControlsProps> = ({ currentSort, onSort }) => {
  return (
    <div className="sort-controls">
      {Object.entries(sortBy)
        .filter(([key]) => key !== 'default')
        .map(([key, value], index) => (
          <React.Fragment key={key}>
            {index > 0 && <span> · </span>}
            <a
              href="#"
              id={key}
              className={currentSort === key ? 'option-selected' : ''}
              onClick={(e) => {
                e.preventDefault();
                onSort(key);
              }}
            >
              {value.label}
            </a>
          </React.Fragment>
        ))}
    </div>
  );
};