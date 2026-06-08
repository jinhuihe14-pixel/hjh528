import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CardIndexPage from './pages/CardIndexPage';
import CardDetailPage from './pages/CardDetailPage';
import LineupPage from './pages/LineupPage';
import StagePage from './pages/StagePage';
import BattlePage from './pages/BattlePage';
import InventoryPage from './pages/InventoryPage';
import ActivityPage from './pages/ActivityPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="cards" element={<CardIndexPage />} />
        <Route path="cards/:id" element={<CardDetailPage />} />
        <Route path="lineup" element={<LineupPage />} />
        <Route path="stage" element={<StagePage />} />
        <Route path="battle/:battleId" element={<BattlePage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="activities" element={<ActivityPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
