import express from "express";
import { addItemToChart, getCart, removeCartItem, updateCartItemQuantity, updateCheckoutDetails } from "../controllers/cart.controller.js";
import { protect } from "../middlewares/authentication.js";

const cartRouter = express.Router();
cartRouter.use(protect);

// Ottiene il carrello dell'utente autenticato
cartRouter.get("/", getCart);


// Aggiunge un prodotto al carrello
cartRouter.post("/items",  addItemToChart);


// Aggiorna la quantità di un prodotto nel carrello
cartRouter.put("/items/:itemId/:variantId", updateCartItemQuantity);


// Rimuove un prodotto dal carrello
cartRouter.delete("/items/:itemId/:variantId",  removeCartItem);


// Aggiorna l'indirizzo di spedizione e il metodo di pagamento del carrello
cartRouter.put("/checkout-details", updateCheckoutDetails);


export default cartRouter;