import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { addItemToCartApi, getCart, removeCartItemApi, updateCartItemQuantityApi } from "../api/cart";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { addToast } = useToast();

    // Funzione per recuperare il carrello dal backend
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated || authLoading) {
            setCart(null); // Assicurati che il carrello sia nullo se non autenticato
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await getCart();
            setCart(response.data);
            return response.data;
        } catch (err) {
            console.error("Errore nel recupero del carrello:", err);
            setError("Errore nel recupero del carrello.");
            setCart(null);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    // Recupera il carrello al mount del componente (o ogni volta che l'utente è autenticato)
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            fetchCart();
        } else if (!isAuthenticated && !authLoading) {
            setCart(null);
        }
    }, [isAuthenticated, authLoading, fetchCart]);

    const addItemToCart = async (itemId, quantity, variantId) => {
        if (!isAuthenticated) {
            addToast("Devi effettuare l'accesso per aggiungere prodotti al carrello.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await addItemToCartApi({
                itemId,
                variantId,
                quantity 
            });
            setCart(response.data);
            return response.data;
        } catch (err) {
            console.error("Errore nell'aggiunta al carrello:", err);
            setError("Si è verificato un problema durante l'aggiornamento del carrello. Riprova più tardi.");
            await fetchCart();
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateCartItemQuantity = async (itemId, variantId, newQuantity) => {
        if (!isAuthenticated) {
            setError("Devi effettuare l'accesso per modificare il carrello.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await updateCartItemQuantityApi(itemId, variantId, { quantity: newQuantity })
            setCart(response.data);
            return response.data;
        } catch (err) {
            console.error("Errore nell'aggiornamento quantità:", err);
            setError("Si è verificato un problema durante l'aggiornamento del carrello. Riprova più tardi.");
            await fetchCart();
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const removeCartItem = async (itemId, variantId) => {
        if (!isAuthenticated) {
            setError("Devi effettuare l'accesso per modificare il carrello.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await removeCartItemApi(itemId, variantId);
            await fetchCart();
            return;
        } catch (err) {
            console.error("Errore nella rimozione dell'articolo:", err);
            setError("Si è verificato un problema durante l'aggiornamento del carrello. Riprova più tardi.");
            await fetchCart();
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const totalCartItemCount = cart?.items
        ? cart.items.reduce((total, item) => total + item.quantity, 0)
        : 0;

    const cartContextValue = {
        cart,
        isLoading,
        error,
        fetchCart,
        addItemToCart,
        updateCartItemQuantity,
        removeCartItem,
        cartItemCount: totalCartItemCount
    };

    return (
        <CartContext.Provider value={cartContextValue}>
            {children}
        </CartContext.Provider>
    );
}

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};