export const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  
  export const formatDate = (date: string): string => {
    const d = new Date(date);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };
  
  export const DAY = 24 * 60 * 60 * 1000;
  
  // src/utils/sorting.ts
  import { Library, SortOptions } from '../types';
  
  const sortByDate = (property: keyof Library) => (a: Library, b: Library) => {
    const aTime = new Date(a[property] as string);
    const bTime = new Date(b[property] as string);
    const today = new Date();
    const diffA = today.getTime() - aTime.getTime();
    const diffB = today.getTime() - bTime.getTime();
    return diffB - diffA;
  };
  
  export const sortBy: SortOptions = {
    default: {
      label: "Default",
      func: (items) => {
        const sortedByNewAsc = sortBy.new.func(items);
        const TWO_WEEKS = 12096e5;
        const timeTwoWeeksAgo = new Date(Date.now() - TWO_WEEKS);
  
        const indexOfItemOlderThan2WeeksAsc =
          sortedByNewAsc.length -
          sortedByNewAsc
            .slice()
            .reverse()
            .findIndex((x) => new Date(x.created) <= timeTwoWeeksAgo);
  
        const topNewItemsAsc = sortedByNewAsc.slice(indexOfItemOlderThan2WeeksAsc);
        const downloadPerWeekAsc = sortBy.downloadsWeek.func(
          sortedByNewAsc.slice(0, indexOfItemOlderThan2WeeksAsc)
        );
  
        return downloadPerWeekAsc.concat(topNewItemsAsc);
      },
    },
    new: {
      label: "New",
      func: (items) => items.sort(sortByDate("created")),
    },
    updates: {
      label: "Updated",
      func: (items) => items.sort(sortByDate("updated")),
    },
    downloadsTotal: {
      label: "Total Downloads",
      func: (items) =>
        items.sort((a, b) => a.downloads.total - b.downloads.total),
    },
    downloadsWeek: {
      label: "Downloads This Week",
      func: (items) =>
        items.sort((a, b) => a.downloads.week - b.downloads.week),
    },
    author: {
      label: "Author",
      func: (items) =>
        items.sort((a, b) => b.authors[0].name.localeCompare(a.authors[0].name)),
    },
    name: {
      label: "Name",
      func: (items) => items.sort((a, b) => b.name.localeCompare(a.name)),
    },
  };