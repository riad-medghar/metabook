import { Navigate, useLocation } from 'react-router-dom';
import pb from '../lib/pocketbase';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = pb.authStore.isValid;
    
    
        
        

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;