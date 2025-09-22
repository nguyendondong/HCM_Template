// Index file for consolidated seed data
// Export all seed data collections for easy import

export { default as heritageSpots } from './heritage-spots-ho-chi-minh.json';
export { default as documents } from './documents-ho-chi-minh.json';
export { default as miniGames } from './mini-games-ho-chi-minh.json';
export { default as overviewStats } from './overview-stats-ho-chi-minh.json';
export { default as learningModules } from './ho-chi-minh-learning-modules.json';
export { default as quizzes } from './ho-chi-minh-quizzes.json';
export { default as vrContent } from './ho-chi-minh-vr-content.json';
export { default as siteContent } from './ho-chi-minh-content.json';
export { default as seedConfiguration } from './seed-configuration.json';

// Re-export seeding functions
export * from '../seedFirestore';

// Type definitions for seed data
export interface SeedDataIndex {
  heritageSpots: any[];
  documents: any[];
  miniGames: any[];
  overviewStats: any[];
  learningModules: any[];
  quizzes: any[];
  vrContent: any[];
  siteContent: any;
  seedConfiguration: any[];
}

// Consolidated export of all data
export const allSeedData: SeedDataIndex = {
  heritageSpots: require('./heritage-spots-ho-chi-minh.json'),
  documents: require('./documents-ho-chi-minh.json'),
  miniGames: require('./mini-games-ho-chi-minh.json'),
  overviewStats: require('./overview-stats-ho-chi-minh.json'),
  learningModules: require('./ho-chi-minh-learning-modules.json').learningModules || [],
  quizzes: require('./ho-chi-minh-quizzes.json'),
  vrContent: require('./ho-chi-minh-vr-content.json').vrExperiences || [],
  siteContent: require('./ho-chi-minh-content.json'),
  seedConfiguration: require('./seed-configuration.json')
};

// Summary statistics
export const seedDataSummary = {
  totalCollections: 8,
  totalRecords: Object.values(allSeedData).reduce((total, collection) => {
    if (Array.isArray(collection)) {
      return total + collection.length;
    }
    return total + 1; // For non-array items like siteContent
  }, 0),
  collections: {
    heritageSpots: allSeedData.heritageSpots.length,
    documents: allSeedData.documents.length,
    miniGames: allSeedData.miniGames.length,
    overviewStats: allSeedData.overviewStats.length,
    learningModules: allSeedData.learningModules.length,
    quizzes: allSeedData.quizzes.length,
    vrContent: allSeedData.vrContent.length,
    siteContent: 1,
    seedConfiguration: allSeedData.seedConfiguration.length
  },
  lastUpdated: '2024-01-01T00:00:00Z'
};
