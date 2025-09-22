import { initializeHeritageSpots } from '../src/services/heritageService';
import { heritageSpots } from '../src/data/heritageSpots';

(async () => {
  try {
    const firebaseSpots = heritageSpots.map(spot => ({
      name: spot.name,
      description: spot.description,
      coordinates: spot.coordinates,
      side: spot.side
    }));
    await initializeHeritageSpots(firebaseSpots);
    console.log('✅ Seed heritage spots thành công!');
  } catch (err) {
    console.error('❌ Seed heritage spots thất bại:', err);
    process.exit(1);
  }
})();
