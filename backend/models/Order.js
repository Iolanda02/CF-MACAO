import { model, Schema } from "mongoose";
import itemOrderSchema from "./ItemOrder.js";
import addressSchema from "./sub-schemas/Address.js";
import validator from "validator";
// import { v4 as uuidv4 } from 'uuid'; 

const orderSchema = new Schema({
    orderNumber: { // (es. "ORD-2025-00001")
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [ itemOrderSchema ],
    shippingCost: {
        amount: {
            type: Number,
            required: [true, "Il costo di spedizione è obbligatorio"],
            min: [0, "Il costo di spedizione non può essere negativo"]
        },
        currency: {
            type: String,
            required: true,
            enum: ["EUR"],
            default: "EUR"
        }
    },
    subtotal: {
        type: Number,
        required: true,
        min: [0, "La somma dei prezzi dei prodotti non può essere negativa"]
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, "Il totale dell'ordine non può essere negativo"]
    },
    currency: {
        type: String,
        required: true,
        default: "EUR",
        enum: ["EUR"]
    },
    shippingAddress: addressSchema,
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                // return /^[0-9\s\-\(\)\+]+$/.test(v);
                return validator.isMobilePhone(v, 'any');
            },
            message: props => `${props.value} non è un numero di telefono valido`
        },
        maxlength: [20, "Il numero di telefono non può superare i 20 caratteri"]
    },
    paymentMethod: {
        type: String,
        enum: ["Credit Card", "PayPal", "Bank Transfer", "Cash on Delivery"],
        // required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded", "Partially Refunded"],
        default: "Pending",
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
        default: "Pending",
        required: true
    },
    discountCode: { 
        type: String, 
        trim: true 
    },
    discountAmount: { 
        type: Number, 
        min: 0, 
        default: 0 
    },
    notes: { 
        type: String, 
        trim: true 
    },
    cancellationReason: {
        type: String,
        trim: true
    },
    orderDate: {
        type: Date
    }
}, { timestamps: true });


// ---- PRE-MIDDLEWARE (HOOKS) ---- 
// Genera orderNumber e calcola i totali prima del salvataggio
orderSchema.pre('save', async function(next) {
    // Costruzione orderNumber
    if (!this.orderNumber) {
        const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'createdAt' : -1 } });
        let nextOrderNumber = 1;
        if (lastOrder && lastOrder.orderNumber) {
            const lastNum = parseInt(lastOrder.orderNumber.split('-').pop());
            if (!isNaN(lastNum)) {
                nextOrderNumber = lastNum + 1;
            }
        }
        this.orderNumber = `ORD-${new Date().getFullYear()}-${String(nextOrderNumber).padStart(5, '0')}`;
    }

    // if (!this.orderNumber) {
    //     this.orderNumber = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`; // Esempio
    // }

    // Calcolo subtotal e totalAmount
    this.subtotal = this.items.reduce((acc, item) => acc + (item.price.amount * item.quantity), 0);
    this.totalAmount = this.subtotal + this.shippingCost.amount - (this.discountAmount || 0);

    next();
});


const Order = model("Order", orderSchema);
export default Order;