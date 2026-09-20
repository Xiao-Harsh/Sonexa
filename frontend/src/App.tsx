import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { LandingPage } from './pages/LandingPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Layout } from './components/ui/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Cinematic Landing Page — standalone, no Layout wrapper */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes wrapped in Layout (music player shell) */}
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/app" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
