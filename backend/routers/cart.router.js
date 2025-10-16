import express from "express";
import { addItemToChart, getCart, removeCartItem, updateCartItemQuantity } from "../controllers/cart.controller.js";

const cartRouter = express.Router();

// Ottiene il carrello dell'utente autenticato
itemRouter.get("/",  getCart);


// Aggiunge un prodotto al carrello
// JSON
// {
//     "itemId": "ID_DEL_PRODOTTO",
//     "variantId": "ID_DELLA_VARIANTE",
//     "quantity": 1
// }
itemRouter.post("/items",  addItemToChart);


// Aggiorna la quantità di un prodotto nel carrello
// JSON
// {
//     "quantity": 3
// }
itemRouter.put("/items/:itemId/:variantId", updateCartItemQuantity);


// Rimuove un prodotto dal carrello
itemRouter.delete("/items/:itemId/:variantId",  removeCartItem);


// Aggiorna l'indirizzo di spedizione e il metodo di pagamento del carrello
// JSON
// {
//     "shippingAddress": { /* addressSchema fields */ },
//     "paymentMethod": "Credit Card"
// }
itemRouter.put("/checkout-details", updateCheckoutDetails);


export default cartRouter;