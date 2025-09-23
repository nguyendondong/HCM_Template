import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EnvironmentIndicator from './components/EnvironmentIndicator';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import HeritageDetailsPage from './pages/HeritageDetailsPage';
import VRExperiencePage from './pages/VRExperiencePage';
import MiniGamesPage from './pages/MiniGamesPage';
import DocumentsPage from './pages/DocumentsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/ContentContext';
import { PageContentProvider } from './contexts/PageContentContext';

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <PageContentProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen">
              {/* Environment Indicator - chỉ hiển thị trong development */}
              <EnvironmentIndicator />

              <Routes>
                {/* Các route admin không render Navbar/Footer */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/*" element={<AdminLayout />} />

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
                        <Route path="/vr-experience/:id" element={<VRExperiencePage />} />
                        <Route path="/mini-games" element={<MiniGamesPage />} />
                        <Route path="/mini-games/:id" element={<MiniGamesPage />} />
                        <Route path="/documents" element={<DocumentsPage />} />
                        <Route path="/documents/:id" element={<DocumentsPage />} />
                      </Routes>
                      <Footer />
                    </>
                  }
                />
              </Routes>
            </div>
          </Router>
        </PageContentProvider>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
