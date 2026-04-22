import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--text-3)',
      }}>
        Loading…
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" replace />;
}
