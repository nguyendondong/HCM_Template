export interface HeritageSpot {
  id: string;
  name: string;
  description: string;
  coordinates?: {
    x: number; // Percentage from left
    y: number; // Percentage from top
  };
  mapPosition?: {
    x: number; // Percentage from left
    y: number; // Percentage from top
  };
  side: 'left' | 'right';
  url?: string; // Optional URL for the spot
}
