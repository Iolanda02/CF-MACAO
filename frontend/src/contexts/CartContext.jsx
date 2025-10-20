import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { addItemToCartApi, getCart, removeCartItemApi, updateCartItemQuantityApi } from "../api/cart";

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Funzione per recuperare il carrello dal backend
    const fetchCart = useCallback(async () => {
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
    }, []);

    // Recupera il carrello al mount del componente (o ogni volta che l'utente è autenticato)
    useEffect(() => {
        // Dovresti avere qui una logica per verificare se l'utente è autenticato
        // e solo in quel caso chiamare fetchCart.
        // Per semplicità, lo chiamiamo sempre per ora.
        fetchCart();
    }, [fetchCart]);

    const addItemToCart = async (itemId, quantity, variantId) => {
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
            setCart(null);
        } finally {
            setIsLoading(false);
        }
    };

    const updateCartItemQuantity = async (itemId, variantId, newQuantity) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await updateCartItemQuantityApi(itemId, variantId, { quantity: newQuantity })
            setCart(response.data);
            return response.data;
        } catch (err) {
            console.error("Errore nell'aggiornamento quantità:", err);
            setError("Si è verificato un problema durante l'aggiornamento del carrello. Riprova più tardi.");
            setCart(null);
            // throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const removeCartItem = async (itemId, variantId) => {
        setIsLoading(true);
        setError(null);
        try {
            await removeCartItemApi(itemId, variantId);
            await fetchCart();
            return;
        } catch (err) {
            console.error("Errore nella rimozione dell'articolo:", err);
            setError("Si è verificato un problema durante l'aggiornamento del carrello. Riprova più tardi.");
            setCart(null);
            // throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const cartContextValue = {
        cart,
        isLoading,
        error,
        fetchCart,
        addItemToCart,
        updateCartItemQuantity,
        removeCartItem,
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