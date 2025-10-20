import protectedApi from "./protectedApi";

// Ottiene il carrello dell'utente autenticato
export async function getCart() {
    try {
        const response = await protectedApi.get(`/cart`);
        // console.log("(API) getCart: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}


// Aggiunge un prodotto al carrello
export async function addItemToCartApi(newItem) {
    try {
        const response = await protectedApi.post(`/cart/items`, newItem);
        // console.log("(API) addItem: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}


// Aggiorna la quantità di un prodotto nel carrello
export async function updateCartItemQuantityApi(itemId, variantId, data) {
    try {
        if(itemId && variantId) {
            const URL = `/cart/items/${itemId}/${variantId}`;
            const response = await protectedApi.put(URL, data);
            // console.log("(API) updateCartItemQuantity: ", response);
            return response.data;
        }
        return;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}


// Rimuove un prodotto dal carrello
export async function removeCartItemApi(itemId, variantId) {
    try {
        if(itemId && variantId) {
            const response = await protectedApi.delete(`/cart/items/${itemId}/${variantId}`);
            // console.log("(API) removeCartItem: ", response);
            return response.data;
        }
        return;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}


// Aggiorna l'indirizzo di spedizione e il metodo di pagamento del carrello
export async function updateCheckoutDetails() {
    try {
        const response = await protectedApi.put(`/checkout-details`);
        // console.log("(API) updateCheckoutDetails: ", response);
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}