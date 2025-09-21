import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HeritageDetailsPage from './pages/HeritageDetailsPage';
import VRExperiencePage from './pages/VRExperiencePage';
import MiniGamesPage from './pages/MiniGamesPage';
import DocumentsPage from './pages/DocumentsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/heritage/:id" element={<HeritageDetailsPage />} />
          <Route path="/vr-experience" element={<VRExperiencePage />} />
          <Route path="/mini-games" element={<MiniGamesPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
