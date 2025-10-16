import { Schema } from "mongoose";

const itemOrderSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    variant: {
        type: Schema.Types.ObjectId,
        ref: "ItemVariant",
        required: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    variantName: {
        type: String,
        trim: true
    },
    sku: {
        type: String,
        trim: true,
    },
    variantImageUrl: {
        url: {
            type: String,
            trim: true,
            validate: {
                validator: function(v) {
                    return (v === this.default) || validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true });
                },
                message: props => `${props.value} non è un URL valido per l'avatar`
            }
        },
        public_id: {
            type: String,
            trim: true
        },
        altText: { 
            type: String, 
            trim: true 
        },
    },
    price: {
        amount: {
           type: Number,
           required: [true, "Il prezzo del prodotto è obbligatorio"],
           min: [0, "Il prezzo non può essere negativo"] 
        },
        currency: {
            type: String,
            required: true,
            enum: ["EUR"],
            default: "EUR"
        }
    },
    quantity: {
        type: Number,
        required: [true, "La quantità è obbligatoria"],
        min: [1, "La quantità non può essere minore di 1"],
        validate: {
            validator: Number.isInteger,
            message: "La quantità deve essere un numero intero"
        }
    },
}, { _id: false });

export default itemOrderSchema;