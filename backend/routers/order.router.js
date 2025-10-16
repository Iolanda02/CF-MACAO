import express from "express";
import { cancelOrder, createOrder, getAllOrders, getOrder, updateOrder, updatePaymentStatus } from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middlewares/authentication.js";

const orderRouter = express.Router();
orderRouter.use(protect);

// Ottiene tutti gli ordini dell'utente autenticato
orderRouter.get("/", getAllOrders);

// Ottiene tutti gli ordini del negozio
orderRouter.get("/admin", restrictTo('admin'), getAllOrders);


// Finalizza il carrello e crea un ordine
orderRouter.post("/", createOrder);


// Ottiene i dettagli di un singolo ordine
orderRouter.get("/:orderId", getOrder);


// Permette all'utente admin di aggiornare alcuni campi di un Ordine
orderRouter.patch("/:orderId", restrictTo('admin'), updateOrder);


// Aggiorna lo stato di pagamento di un ordine
// orderRouter.post("/:orderId/payment-status", updatePaymentStatus);
orderRouter.patch("/:orderId/payment-status", restrictTo('admin'), updatePaymentStatus);


// Cancella un ordine
orderRouter.post("/:orderId/cancel", cancelOrder);


export default orderRouter;