export interface HeritageSpot {
  id: string;
  name: string;
  description: string;
  coordinates: {
    x: number; // Percentage from left
    y: number; // Percentage from top
  };
  side: 'left' | 'right';
}