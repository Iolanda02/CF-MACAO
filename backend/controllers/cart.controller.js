import mongoose from "mongoose";
import Order from "../models/Order.js";
import Item from "../models/Item.js";
import ItemVariant from "../models/ItemVariant.js";
import AppError from "../utils/appError.js";
import { DEFAULT_PRODUCT_IMAGE_PUBLIC_ID, DEFAULT_PRODUCT_IMAGE_URL } from "../config/cloudinary.config.js";

/**
 * @desc Recupera l'ordine attualmente in stato "Pending" per l'utente autenticato. Se non esiste, ne crea uno vuoto.
 * @route GET /api/v1/cart
 * @access Privato (Utente autenticato)
 */
export const getCart = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("ID utente non valido", 400))
    }

    try {
        let cart = await Order.findOne({
            user: userId,
            orderStatus: "Pending",
            paymentStatus: "Pending"
        })
        // .populate('user')
        .populate({
            path: 'items.item',
            select: 'name description imageUrls slug'
        })
        .populate({
            path: 'items.variant',
            select: 'sku weight stock price'
        });

        if(!cart) {
            cart = await Order.create({
                user: userId,
                orderNumber: 'ORD-' + Date.now(),
                items: [],
                shippingCost: { amount: 0, currency: "EUR" },
                subtotal: 0,
                totalAmount: 0,
                currency: "EUR",
                paymentStatus: "Pending",
                orderStatus: "Pending",
            });
            
            cart = await Order.findById(cart._id)
                // .populate('user')
                .populate({
                    path: 'items.item',
                    select: 'name brand description slug'
                })
                .populate({
                    path: 'items.variant',
                    select: 'name sku weight stock price images'
                });
        }

        res.status(200).json({
            status: 'success',
            data: cart
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @desc Aggiunge una specifica variante di un prodotto al carrello dell'utente autenticato. Se il prodotto è già nel carrello, aggiorna la quantità. 
 * @route POST /api/v1/cart/items
 * @access Privato (utente autenticato)
 */
export const addItemToChart = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("ID utente non valido", 400))
    }
    
    const { itemId, variantId, quantity } = req.body;
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return next(new AppError("ID prodotto non valido", 400));
    }
    
    if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
        return next(new AppError("ID variante prodotto non valido", 400));
    }
    
    if (!quantity || typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
        return next(new AppError("La quantità deve essere un numero intero positivo", 400));
    }
    
    try {
        let cart = await Order.findOne({
            user: userId,
            orderStatus: "Pending",
            paymentStatus: "Pending"
        });
        
        if(!cart) {
            return next(new AppError("Carrello non trovato", 404));
        }
        
        const item = await Item.findById(itemId);
        if (!item) {
            return next(new AppError("Prodotto non trovato", 404));
        }
        
        const variant = await ItemVariant.findById(variantId);
        if (!variant) {
            return next(new AppError("Variante prodotto non trovata", 404));
        }
        
        // Verifica che la variante appartenga al prodotto corretto
        if (variant.item.toString() !== itemId.toString()) {
            return next(new AppError("La variante non appartiene al prodotto specificato", 400));
        }
        
        // Verifica disponibilità in magazzino
        if (variant.stock && variant.stock.quantity < quantity) {
            return next(new AppError(`Scorte insufficienti per ${item.name} - ${variant.sku}. Disponibili: ${variant.stock.quantity}`, 400));
        }
        
        // Controlla se l'elemento è già nel carrello
        const existingItemIndex = cart.items.findIndex(
            (cartItem) =>
                cartItem.item.toString() === itemId.toString() &&
            cartItem.variant.toString() === variantId.toString()
        );
        
        if (existingItemIndex > -1) {
            // Se l'elemento esiste, aggiorna la quantità
            const currentQuantity = cart.items[existingItemIndex].quantity;
            const newQuantity = currentQuantity + quantity;
            
            // Verifica disponibilità in magazzino
            if (variant.stock && variant.stock.quantity < newQuantity) {
                return next(new AppError(`Scorte insufficienti per ${item.name} - ${variant.sku}. Disponibili: ${variant.stock.quantity}`, 400));
            }

            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Se l'elemento non esiste, aggiungilo al carrello
            cart.items.push({
                item: itemId,
                variant: variantId,
                productName: item.name,
                variantName: variant.name,
                sku: variant.sku,
                variantImageUrl: {
                    url: variant.images?.find(i => i.isMain)?.url || DEFAULT_PRODUCT_IMAGE_URL,
                    public_id: variant.images?.find(i => i.isMain)?.public_id || DEFAULT_PRODUCT_IMAGE_PUBLIC_ID,
                    altText: variant.images?.find(i => i.isMain)?.altText || `Immagine per ${item.name}`
                },
                price: {
                    amount: variant.price.amount,
                    currency: variant.price.currency || "EUR"
                },
                quantity: quantity,
            });
        }

        await cart.save();

        const updatedCart = await Order.findById(cart._id)
            // .populate('user')
            .populate({
                path: 'items.item',
                select: 'name brand description slug'
            })
            .populate({
                path: 'items.variant',
                select: 'name sku weight stock price images'
            });
        
        res.status(200).json({
            status: 'success',
            data: updatedCart
        });
    } catch (error) {
        next(error);
    }
}


/**
 * @desc Aggiorna la quantità di una specifica variante di un prodotto nel carrello dell'utente autenticato. Se la quantità è 0, rimuove l'elemento. 
 * @route PUT /api/v1/cart/items/:itemId/:variantId
 * @access Privato (utente autenticato)
 */
export const updateCartItemQuantity = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("ID utente non valido", 400))
    }

    const { itemId, variantId } = req.params;
    const { quantity } = req.body;
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return next(new AppError("ID prodotto non valido", 400));
    }
    
    if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
        return next(new AppError("ID variante prodotto non valido", 400));
    }
    
    if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
        return next(new AppError("La quantità non può essere negativa", 400));
    }

    try {
        let cart = await Order.findOne({
            user: userId,
            orderStatus: "Pending",
            paymentStatus: "Pending"
        });
        
        if(!cart) {
            return next(new AppError("Carrello non trovato", 404));
        }
        
        // Trova l'indice dell'elemento nel carrello
        const existingItemIndex = cart.items.findIndex(
            (cartItem) =>
                cartItem.item.toString() === itemId.toString() &&
            cartItem.variant.toString() === variantId.toString()
        );
        
        if (existingItemIndex === -1) {
            return next(new AppError("Prodotto o variante non trovato nel carrello", 404));
        }

        if (quantity <= 0) {
            cart.items.splice(existingItemIndex, 1);
            await cart.save();
            
            const updatedCart = await Order.findById(cart._id)
                .populate({ 
                    path: 'items.item', 
                    select: 'name description imageUrls slug' 
                })
                .populate({ 
                    path: 'items.variant', 
                    select: 'sku weight stock price' 
                });

            return res.status(200).json({
                status: 'success',
                data: updatedCart
            });
        }

        const variant = await ItemVariant.findById(variantId);
        if (!variant) {
            return next(new AppError("Variante prodotto non trovata per il controllo magazzino", 404));
        }

        // Verifica disponibilità in magazzino
        if (variant.stock && variant.stock.quantity < quantity) {
            const item = await Item.findById(itemId);
            if (!item) {
                return next(new AppError("Prodotto non trovato per il controllo magazzino", 404));
            }

            return next(new AppError(`Scorte insufficienti per ${item.name} - ${variant.sku}. Richiesti: ${quantity}, Disponibili: ${variant.stock.quantity}`, 400));
        }

        // Aggiorna la quantità
        cart.items[existingItemIndex].quantity = quantity;

        await cart.save();
        
        const updatedCart = await Order.findById(cart._id)
            // .populate('user')
            .populate({
                path: 'items.item',
                select: 'name brand description slug'
            })
            .populate({
                path: 'items.variant',
                select: 'name sku weight stock price images'
            });

        res.status(200).json({
            status: 'success',
            data: updatedCart
        });

    } catch (error) {
        next(error);
    }
}


/**
 * @desc Rimuove una specifica variante di un prodotto dal carrello dell'utente autenticato
 * @route DELETE /api/v1/cart/items/:itemId/:variantId
 * @access Privato (utente autenticato)
 */
export const removeCartItem = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("ID utente non valido", 400))
    }
    
    const { itemId, variantId } = req.params;
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return next(new AppError("ID prodotto non valido", 400));
    }
    
    if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
        return next(new AppError("ID variante non valido", 400));
    }

    try {
        let cart = await Order.findOne({
            user: userId,
            orderStatus: "Pending",
            paymentStatus: "Pending"
        });
        
        if(!cart) {
            return next(new AppError("Carrello non trovato", 404));
        }
        
        // Trova l'indice dell'elemento nel carrello
        const existingItemIndex = cart.items.findIndex(
            (cartItem) =>
                cartItem.item.toString() === itemId.toString() &&
            cartItem.variant.toString() === variantId.toString()
        );
        
        if (existingItemIndex === -1) {
            res.status(200).json({
                status: 'success',
                message: 'Articolo non trovato nel carrello o già rimosso'
            });
        }

        cart.items.splice(existingItemIndex, 1);

        await cart.save();

        const updatedCart = await Order.findById(cart._id)
            // .populate('user')
            .populate({
                path: 'items.item',
                select: 'name brand description slug'
            })
            .populate({
                path: 'items.variant',
                select: 'name sku weight stock price images'
            });

        res.status(200).json({
            status: 'success',
            data: updatedCart
        });
    } catch (error) {
        next(error);
    }
}


/**
 * @desc Aggiorna i dettagli di spedizione e pagamento del carrello dell'utente autenticato
 * @route PUT /api/v1/cart/checkout-details
 * @access Privato (utente autenticato)
 */
export const updateCheckoutDetails = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("ID utente non valido", 400))
    }

    const { shippingAddress, paymentMethod } = req.body;

    try {
        let cart = await Order.findOne({
            user: userId,
            orderStatus: "Pending",
            paymentStatus: "Pending"
        });
        
        if(!cart) {
            return next(new AppError("Carrello non trovato", 404));
        }
        
        // Validazione e Aggiornamento del Metodo di Pagamento
        if (paymentMethod) {
            // Controlla se il metodo di pagamento è tra quelli validi
            const allowedPaymentMethods = Order.schema.path('paymentMethod').enumValues;
            if (!allowedPaymentMethods.includes(paymentMethod)) {
                return next(new AppError(`Metodo di pagamento non valido. I metodi consentiti sono: ${allowedPaymentMethods.join(', ')}.`, 400));
            }
            cart.paymentMethod = paymentMethod;
        }

        // Validazione e Aggiornamento dell'Indirizzo di Spedizione
        if (shippingAddress) {
            cart.shippingAddress = shippingAddress;
            cart.phone = shippingAddress.mobilePhoneNumber;
        }

        await cart.save();

        const updatedCart = await Order.findById(cart._id)
            .populate({ 
                path: 'items.item', 
                select: 'name description imageUrls slug' 
            })
            .populate({ 
                path: 'items.variant', 
                select: 'sku weight stock price' 
            });

        res.status(200).json({
            status: 'success',
            data: updatedCart
        });
    } catch (error) {
        next(error);
    }
}