import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HeritageDetailsPage from './pages/HeritageDetailsPage';
import VRExperiencePage from './pages/VRExperiencePage';
import MiniGamesPage from './pages/MiniGamesPage';
import DocumentsPage from './pages/DocumentsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Các route admin không render Navbar/Footer */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Các route public có Navbar/Footer */}
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/heritage/:id" element={<HeritageDetailsPage />} />
                    <Route path="/vr-experience" element={<VRExperiencePage />} />
                    <Route path="/mini-games" element={<MiniGamesPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                  </Routes>
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
