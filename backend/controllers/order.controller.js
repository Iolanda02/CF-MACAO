import mongoose from "mongoose";
import Order from "../models/Order.js";
import ItemVariant from "../models/ItemVariant.js";
import AppError from "../utils/appError.js";

/**
 * @desc Recupera tutti gli ordini nel sistema per un utente admin oppure un elenco di tutti gli ordini effettuati dall'utente autenticato, con opzioni di filtro e paginazione
 * @route GET /api/v1/orders
 * @access Privato (utente autenticato)
 */
export const getAllOrders = async (req, res, next) => {
    const user = req.user;
    if (!user || !mongoose.Types.ObjectId.isValid(user.id)) {
        return next(new AppError("ID utente non valido", 400))
    }
    const searchTerm = req.query.search;
    const searchField = req.query.searchField || 'orderNumber';
    
    const allowedSearchFields = ['orderNumber', 'paymentStatus', 'orderStatus'];
    if (searchField && !allowedSearchFields.includes(searchField)) {
        return next(
            new AppError(
                `Campo di ricerca non valido. Campi permessi: ${allowedSearchFields.join(', ')}`, 
                400
            )
        );
    }

    let queryObj = {};
    queryObj.orderStatus = { $ne: 'Pending' };

    if (searchTerm) {
        queryObj[searchField] = new RegExp(searchTerm, "i");
    }
    if(user.role == 'user') {
        queryObj.user = user.id;
    }

    let page = parseInt(req.query.page) || 1;
    if (page < 1) page = 1;

    let perPage = parseInt(req.query.perPage) || 3;
    if (perPage < 1 || perPage > 25) perPage = 10;

    try {
        const totalCount = await Order.countDocuments(queryObj);
        const totalPages = Math.ceil(totalCount / perPage);

        const orders = await Order.find(queryObj)
            .populate('user', 'firstName lastName email phone')
            .populate('items.item', 'name description')
            .populate('items.variant', 'name sku attributes')
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.status(200).send({
            page,
            perPage,
            totalPages,
            totalCount,
            data: orders
        });
    } catch (error) {
        next(error);
    }
}


/**
 * @desc Converte il carrello dell'utente (orderStatus: "Pending") in un ordine effettivo
 * @route POST /api/v1/orders
 * @access Privato (utente autenticato)
 */
export const createOrder = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("ID utente non valido", 400))
    }

    // const { paymentDetails, paymentMethod, shippingAddress } = req.body; //DA verificare
    const paymentMethod = req.body?.paymentMethod;
    const shippingAddress = req.body?.shippingAddress;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const cart = await Order.findOne({ 
            user: userId, 
            orderStatus: "Pending" 
        }).session(session);
        
        if(!cart) {
            return next(new AppError("Nessun carrello trovato per l'utente", 404));
        }
        
        if (cart.items.length === 0) {
            return next(new AppError("Il carrello è vuoto: impossibile creare un ordine.", 400));
        }

        for (const cartItem of cart.items) {
            const variant = await ItemVariant.findById(cartItem.variant).session(session);
            if (!variant) {
                return next(new AppError(`Variante di prodotto non trovata per ID: ${cartItem.variant}`, 404));
            }
            
            // Verifica disponibilità in magazzino
            if (variant.stock.quantity < cartItem.quantity) {
                return next(new AppError(`Scorte insufficiente per il prodotto ${cartItem.productName} (${variant.sku}). Disponibilità: ${variant.stock.quantity}, Richiesta: ${cartItem.quantity}`, 400));
            }
            
            variant.stock.quantity -= cartItem.quantity;
            await variant.save({ session });
            
            
            cart.orderStatus = "Processing";
            cart.paymentStatus = "Pending";
            cart.paymentMethod = paymentMethod || cart.paymentMethod;
            cart.orderDate = Date.now();
            
            
            if (shippingAddress) {
                cart.shippingAddress = shippingAddress;
                cart.phone = shippingAddress.mobilePhoneNumber || '';
            } else if (!cart.shippingAddress || Object.keys(cart.shippingAddress).length === 0) {
                return next(new AppError("L\'indirizzo di spedizione è obbligatorio per finalizzare l'ordine", 400));
            }
            
            // Possibile logica per elaborare il pagamento
            // const paymentResult = await processPaymentWithStripe(paymentDetails, cart.totalAmount, cart.currency);
            // if (paymentResult.success) {
            //     cart.paymentStatus = "Paid";
            // } else {
            //     cart.paymentStatus = "Failed";
            //     cart.orderStatus = "Cancelled";
            //     return next(new AppError("Pagamento fallito. Riprova più tardi.", 400));
            // }

            await cart.save({ session });

            await session.commitTransaction();
            session.endSession();
            
            res.status(201).json({
                status: 'success',
                data: cart
            });
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}


/**
 * @desc Recupera i dettagli di un ordine specifico. Se l'utente autenticato è user l'odine deve appartenere a lui. Se l'utente è admin non ci sono restrizioni.
 * @route GET /api/v1/orders/:orderId
 * @access Privato (utente autenticato)
 */
export const getOrder = async (req, res, next) => {
    const user = req.user;
    if (!user || !mongoose.Types.ObjectId.isValid(user.id)) {
        return next(new AppError("ID utente non valido", 400))
    }

    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new AppError("ID ordine non valido", 400));
    }
    
    let query = { _id: orderId };
    
    if (user.role !== 'admin') {
        query.user = user._id;
        // query.orderStatus = { $ne: 'Pending' };
    }
    
    try {
        const order = await Order.findOne(query)
        .populate('user', 'firstName lastName email')
        .populate('items.item', 'name description')
        .populate('items.variant', 'sku attributes');
        
        if (!order) {
            return next(new AppError("Ordine non trovato o non autorizzato", 404));
        }

        res.status(200).json({
            status: 'success',
            data: order
        });
    } catch (error) {
        next(error);
    }
}


/**
 * @desc Permette all'utente Admin di aggiornare i campi di un ordine, come lo stato di spedizione di un ordine.
 * @route PATCH /api/v1/orders/:orderId
 * @access Privato (utente autenticato)
 */
export const updateOrder = async (req, res, next) => {
    const user = req.user;
    if (!user || !mongoose.Types.ObjectId.isValid(user.id)) {
        return next(new AppError("ID utente non valido", 400))
    }

    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new AppError("ID ordine non valido", 400));
    }
    
    if (user.role !== 'admin') {
        return next(new AppError("Non autorizzato ad aggiornare gli ordini", 403));
    }

    const updates = req.body;
    
    try {
        const order = await Order.findById(orderId);
        
        if(!order) {
            return next(new AppError("Ordine non trovato", 404));
        }
        
        const allowedUpdates = [
            'orderStatus',
            'paymentStatus',
            'shippingAddress', 
            'paymentMethod',
            'shippingCost',
            'discountCode',
            'discountAmount',
            'notes'
        ];
        
        for (const key in updates) {
            if (allowedUpdates.includes(key)) {
                if (key === 'shippingAddress' || key === 'shippingCost') {
                    order[key] = { ...order[key], ...updates[key] };
                } else {
                    order[key] = updates[key];
                }
            } else {
                return next(new AppError(`Tentativo di aggiornare il campo non consentito: ${key}`, 400));
            }
        }

        await order.save();

        const updatedOrder = await Order.findById(orderId)
                                        .populate('user', 'firstName lastName email')
                                        .populate('items.item', 'name description')
                                        .populate('items.variant', 'sku attributes');

        res.status(200).json({
            status: 'success',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
}


/**
 * @desc Aggiorna lo stato di pagamento dell'ordine dopo una transazione
 * @route POST /api/v1/orders/:orderId/payment-status
 * @access Privato
 */
export const updatePaymentStatus = async (req, res, next) => {
    const user = req.user;
    if (!user || !mongoose.Types.ObjectId.isValid(user.id)) {
        return next(new AppError("ID utente non valido", 400))
    }

    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new AppError("ID ordine non valido", 400));
    }

    const paymentStatus = req.body?.paymentStatus;

    try {
        const order = await Order.findById(orderId);
        
        if(!order) {
            return next(new AppError("Ordine non trovato", 404));
        }

        // DA COMPLETARE
        order.paymentStatus = paymentStatus;
        
        await order.save();

        const updatedOrder = await Order.findById(orderId)
                                        .populate('user', 'firstName lastName email')
                                        .populate('items.item', 'name description')
                                        .populate('items.variant', 'sku attributes');

        res.status(200).json({
            status: 'success',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
}
    

/**
 * @desc Consente all'utente di richiedere la cancellazione di un ordine, se l'ordine non è ancora stato spedito. Le scorte vengono ripristinate.
 * @route POST /api/v1/orders/:orderId/cancel
 * @access Privato (utente autenticato)
 */
export const cancelOrder = async (req, res, next) => {
    const user = req.user;
    if (!user || !mongoose.Types.ObjectId.isValid(user.id)) {
        return next(new AppError("ID utente non valido", 400))
    }

    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new AppError("ID ordine non valido", 400));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findOne({ _id: orderId, user: user.id }).session(session);

        if(!order) {
            return next(new AppError("Ordine non trovato o non autorizzato alla cancellazione", 404));
        }
        
        const cancellableStatuses = ["Pending", "Processing"];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            return next(new AppError("L\'ordine non è più cancellabile", 400));
        }

        for (const orderItem of order.items) {
            const variant = await ItemVariant.findById(orderItem.variant).session(session);

            if (!variant) {
                return next(new AppError("Variante prodotto non trovata per il ripristino scorte", 404));
            } else {
                variant.stock.quantity += orderItem.quantity;
                await variant.save({ session });
            }
        }

        order.orderStatus = "Cancelled";
        order.paymentStatus = "Refunded";
        order.cancellationReason = req.body?.reason || "Cancellato dall'utente";

        await order.save({ session });

        await session.commitTransaction();
        session.endSession();
        
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}


// Funzione helper per costruire i filtri basati sui query params
const buildOrderQuery = (userRole, userId, queryParams) => {
    let query = {};

    // Se non è un admin, l'utente può vedere solo i propri ordini (esclusi i carrelli 'Pending')
    if (userRole !== 'admin') {
        query.user = userId;
        query.orderStatus = { $ne: 'Pending' };
    }

    // Filtro per stato dell'ordine
    if (queryParams.status) {
        const statuses = queryParams.status.split(',').map(s => s.trim());
        query.orderStatus = { $in: statuses };
    }

    if (queryParams.paymentStatus) {
        query.paymentStatus = queryParams.paymentStatus;
    }
    if (queryParams.orderNumber) {
        query.orderNumber = { $regex: queryParams.orderNumber, $options: 'i' };
    }

    return query;
}