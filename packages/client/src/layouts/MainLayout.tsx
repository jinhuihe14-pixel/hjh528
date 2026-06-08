import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ResourceBar from '../components/ResourceBar';
import BottomNav from '../components/BottomNav';

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const player = useAuthStore((state) => state.player);

  const showBottomNav = !['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <ResourceBar />
      <main className="flex-1 pb-20 overflow-auto">
        <Outlet />
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default MainLayout;
