import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { loginApi, profile, registerApi } from '../api/authentication';
import { useToast } from './ToastContext';

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [authUser, setAuthUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { addToast } = useToast();
    
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
            setToken(null);
            setAuthUser(null);
            setError("Sessione scaduta o token non valido. Effettua nuovamente l'accesso.");
            // addToast("Sessione scaduta o token non valido. Effettua nuovamente l'accesso.", "danger");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    // Effetto per gestire l'inizializzazione del token e caricare il profilo
    useEffect(() => {
        if (token) {
            loadUserProfile(token);
        } else {
            setAuthUser(null);
            setIsLoading(false);
        }
    }, [token, loadUserProfile]);


    // Funzione di Login
    const login = async (credentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await loginApi(credentials);
            const newToken = response.token;
            const user = response.data.user;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            // setAuthUser(user);
            addToast("Accesso effettuato con successo!", "success");
        } catch (err) {
            console.error("Login failed:", err);
            setError("Accesso non riuscito. Controlla le tue credenziali.");
            addToast("Accesso non riuscito. Controlla le tue credenziali.", "danger");
            setToken(null);
            setAuthUser(null);
            setIsLoading(false);
            throw new Error(err); 
        }
    };

     
    const handleSocialLogin = useCallback(async (jwt) => {
        setIsLoading(true);
        setError(null);
        try {
            localStorage.setItem('token', jwt);
            setToken(jwt);
            addToast("Accesso con Google effettuato con successo!", "success");
            return true;
        } catch (err) {
            console.error("Social Login failed:", err);
            setError("Accesso con Google non riuscito. Riprova.");
            addToast("Accesso con Google non riuscito. Riprova.", "danger");
            localStorage.removeItem('token');
            setToken(null);
            setAuthUser(null);
            setIsLoading(false);
            return false;
        }
    }, [addToast]);

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
        localStorage.removeItem('token');
        setToken(null);
        setAuthUser(null);
        addToast("Disconnessione effettuata.", "info")
    };

    const value = {
        token,
        authUser,
        setAuthUser,
        isAuthenticated: !!token && !!authUser,
        isLoading,
        error,
        login,
        register,
        logout,
        handleSocialLogin
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