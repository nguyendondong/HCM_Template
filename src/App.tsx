import React from 'react';
import HeroSection from './components/HeroSection';
import MapSection from './components/MapSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <MapSection />
      <Footer />
    </div>
  );
}

export default App;