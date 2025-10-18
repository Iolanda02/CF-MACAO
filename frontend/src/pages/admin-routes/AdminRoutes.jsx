import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

// Componente per proteggere le rotte admin
const AdminRoutes = () => {
    const { isAuthenticated, authUser, isLoading } = useAuth();
    const isAdmin = authUser && authUser.role === 'admin';

    if (isLoading) {
        return <div>Loading authentication...</div>;
    }

    return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoutes;