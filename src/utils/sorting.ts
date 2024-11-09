import { Library, SortOptions } from '../types';

const sortByDate = (property: keyof Library) => (a: Library, b: Library) => {
  const aTime = new Date(a[property] as string);
  const bTime = new Date(b[property] as string);
  const today = new Date();
  const diffA = today.getTime() - aTime.getTime();
  const diffB = today.getTime() - bTime.getTime();
  return diffA - diffB; // Inverse the order
};

export const sortBy: SortOptions = {
  default: {
    label: "Default",
    func: (items) => items.sort((a, b) => a.name.localeCompare(b.name)),
  },
  new: {
    label: "New",
    func: (items) => items.sort(sortByDate("created")),
  },
  author: {
    label: "Author",
    func: (items) =>
      items.sort((a, b) => a.authors[0].name.localeCompare(b.authors[0].name)), // Inverse the order
  },
  name: {
    label: "Name",
    func: (items) => items.sort((a, b) => a.name.localeCompare(b.name)),
  },
};