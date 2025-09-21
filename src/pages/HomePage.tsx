import React, { useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import IntroductionSection from '../components/IntroductionSection';
import MapSection from '../components/MapSection';
import DocumentsSection from '../components/DocumentsSection';
import VRTechnologySection from '../components/VRTechnologySection';
import MiniGameSection from '../components/MiniGameSection';
import { scrollToHanoi } from '../components/MapSection';

const HomePage: React.FC = () => {
  // Handle navigation to specific section after returning from details page
  useEffect(() => {
    const targetSection = sessionStorage.getItem('targetSection');
    if (targetSection) {
      // Clear the stored section
      sessionStorage.removeItem('targetSection');

      // Wait for components to mount then scroll to target section
      setTimeout(() => {
        if (targetSection === 'journey') {
          // Special handling for map section
          scrollToHanoi();
        } else if (targetSection === 'introduction') {
          // Special handling for introduction section
          const element = document.getElementById('introduction');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('introductionNavClick'));
            }, 50);
          }
        } else {
          // Regular sections - direct mapping
          const sectionMap: { [key: string]: string } = {
            'overview': 'overview',
            'documents': 'documents',
            'vr-technology': 'vr-technology',
            'mini-game': 'mini-game'
          };

          const elementId = sectionMap[targetSection] || targetSection;
          const sectionElement = document.getElementById(elementId);

          if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100); // Small delay to ensure components are mounted
    }
  }, []);

  return (
    <>
      <HeroSection />
      <IntroductionSection />
      <MapSection />
      <DocumentsSection />
      <VRTechnologySection />
      <MiniGameSection />
    </>
  );
};

export default HomePage;
