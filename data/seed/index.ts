// Refined Seed Data Exports
// This file exports all the refined seed data for the Heritage Journey application

// REFINED SEED DATA (Version 2.0)
// Landing page content (Hero, Introduction, Documents, VR, Mini Games sections)
export { default as landingPageContent } from './landing-page-content.json';

// Heritage spots and historical locations
export { default as heritageSpots } from './heritage-spots-refined.json';

// Documents with categories
export { default as documentsData } from './documents-refined.json';

// Educational mini games
export { default as miniGames } from './mini-games-refined.json';

// VR experiences and collections
export { default as vrContent } from './vr-content-refined.json';

// Seed configuration and metadata
export { default as seedConfig } from './seed-configuration-refined.json';

// Refined seed collection definitions for automated seeding
export const REFINED_SEED_COLLECTIONS = [
  {
    name: 'landingPageContent',
    firebaseCollection: 'pageContent',
    documentId: 'landing-page',
    type: 'single_document',
    priority: 1
  },
  {
    name: 'heritageSpots',
    firebaseCollection: 'heritage-spots',
    type: 'collection',
    priority: 2
  },
  {
    name: 'documentCategories',
    firebaseCollection: 'document-categories',
    type: 'collection',
    priority: 3
  },
  {
    name: 'documents',
    firebaseCollection: 'documents',
    type: 'collection',
    priority: 4
  },
  {
    name: 'miniGames',
    firebaseCollection: 'mini-games',
    type: 'collection',
    priority: 5
  },
  {
    name: 'vrExperiences',
    firebaseCollection: 'vr-experiences',
    type: 'collection',
    priority: 6
  },
  {
    name: 'vrCollections',
    firebaseCollection: 'vr-collections',
    type: 'collection',
    priority: 7
  },
    {
    name: 'vrFeatured',
    firebaseCollection: 'vr-featured',
    type: 'collection',
    priority: 7
  }
];

// Refined seed data summary
export const refinedSeedSummary = {
  version: '2.0.0',
  created: '2025-09-23',
  description: 'Refined and restructured seed data for Heritage Journey application',
  totalCollections: 8,
  totalDocuments: 35,
  estimatedSeedTime: '2-3 minutes',
  features: [
    'Structured landing page content',
    'Comprehensive heritage spots data',
    'Rich document management',
    'Interactive mini games',
    'Immersive VR experiences',
    'Configurable site settings'
  ],
  collections: {
    landingPageContent: 1,
    heritageSpots: 8,
    documentCategories: 4,
    documents: 8,
    miniGames: 6,
    vrExperiences: 6,
    vrCollections: 2,
    siteConfig: 1
  }
};
