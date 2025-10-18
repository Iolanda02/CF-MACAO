import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';


// Componente per proteggere le rotte autenticate
const ProtectedRoutes = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading authentication...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;