import { HeritageSpot } from '../types/heritage';

export const heritageSpots: HeritageSpot[] = [
  {
    id: 'nghe-an',
    name: 'Nghe An',
    description: "Uncle Ho's hometown - Where the great leader was born and spent his early years, shaping his revolutionary spirit.",
    coordinates: { x: 45, y: 55 },
    side: 'right'
  },
  {
    id: 'hanoi',
    name: 'Hanoi',
    description: 'Ho Chi Minh Mausoleum - The sacred resting place where millions come to pay respects to the beloved leader.',
    coordinates: { x: 48, y: 25 },
    side: 'left'
  },
  {
    id: 'cao-bang',
    name: 'Cao Bang',
    description: 'Pac Bo - The historic cave where Uncle Ho returned to Vietnam and planned the revolution that freed the nation.',
    coordinates: { x: 52, y: 15 },
    side: 'right'
  },
  {
    id: 'tuyen-quang',
    name: 'Tuyen Quang',
    description: 'Tan Trao - The first National Congress location where the foundation of modern Vietnam was established.',
    coordinates: { x: 47, y: 20 },
    side: 'left'
  },
  {
    id: 'ho-chi-minh-city',
    name: 'Ho Chi Minh City',
    description: 'Nha Rong Wharf - The departure point where young Nguyen Tat Thanh began his journey to become Ho Chi Minh.',
    coordinates: { x: 48, y: 85 },
    side: 'right'
  }
];