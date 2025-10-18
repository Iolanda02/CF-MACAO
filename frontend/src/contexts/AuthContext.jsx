import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { profile, loginApi, registerApi } from '../api/authentication';

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [authUser, setAuthUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Effetto per gestire l'inizializzazione del token e caricare il profilo
    useEffect(() => {
        if (token) {
            loadUserProfile(token);
        } else {
            setAuthUser(null);
            setIsLoading(false);
        }
    }, [token, loadUserProfile]);


    // Funzione per caricare il profilo utente in base al token
    const loadUserProfile = useCallback(async (authToken) => {
        if (!authToken) {
            setAuthUser(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const user = await profile(authToken);
            setAuthUser(user);
        } catch (err) {
            console.error("Failed to load user profile:", err);
            localStorage.removeItem('token');
            setToken(null); // triggera l'useEffect successivo
            setAuthUser(null);
            setError("Sessione scaduta o token non valido. Effettua nuovamente l'accesso.");
        } finally {
            setIsLoading(false);
        }
    }, []);


    // Funzione di Login
    const login = async (credentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await loginApi(credentials);
            const newToken = response.token;
            const user = response.data.user;

            localStorage.setItem('token', newToken);
            setToken(newToken); // triggera l'useEffect per loadUserProfile
            setAuthUser(user);

            // Vai alla home
            navigate('/', { replace: true });

            // Login ok 
            return true;
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.message || "Accesso non riuscito. Controlla le tue credenziali.");
            setToken(null);
            setAuthUser(null);
            setIsLoading(false);

            // Login ko
            return false;
        }
    };

    // Funzione di Registrazione
    const register = async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await registerApi(userData);

            // Dopo la registrazione andiamo alla pagina di login?

            // const newToken = response.token;
            // const user = response.user;
            // localStorage.setItem('token', newToken);
            // setToken(newToken);
            // setAuthUser(user);
            // navigate('/', { replace: true }); 

            return true;
        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.message || "Registrazione non riuscita. Riprova.");
            setToken(null);
            setAuthUser(null);
            setIsLoading(false);
            return false;
        }
    }

        
    // Funzione di Logout
    const logout = async () => {
        // setIsLoading(true);
        // setError(null);
        // try {
        //     await apiLogout(token);
        // } catch (err) {
        //     console.warn("Logout API call failed with error:", err);
        // } finally {
        //     localStorage.removeItem('token');
        //     setToken(null);
        //     setAuthUser(null);
        //     setIsLoading(false);
        //     navigate('/', { replace: true });
        // }
        
        localStorage.removeItem('token');
        setToken(null);
        setAuthUser(null);
        navigate('/', { replace: true });
    };

    const value = {
        token,
        authUser,
        isAuthenticated: !!token && !!authUser,
        isLoading,
        error,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}