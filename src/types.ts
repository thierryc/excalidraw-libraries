export interface Author {
    name: string;
    url: string;
  }
  
  export interface Library {
    id: string;
    name: string;
    description: string;
    source: string;
    preview: string;
    authors: Author[];
    created: string;
    updated: string;
    itemNames?: string[];
    version?: number;
    downloads: {
      total: number;
      week: number;
    };
  }
  
  export interface Stats {
    [key: string]: {
      total: number;
      week: number;
    };
  }
  
  export type SortFunction = (items: Library[]) => Library[];
  
  export interface SortOption {
    label: string;
    func: SortFunction;
  }
  
  export type SortOptions = {
    [key: string]: SortOption;
  };
  
  export const APP_NAMES: { [key: string]: string } = {
    "Excalidraw+": "https://app.excalidraw.com",
    Excalidraw: "https://excalidraw.com",
    Excalideck: "https://app.excalideck.com",
  };