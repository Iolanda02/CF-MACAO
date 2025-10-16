import { model, Schema } from "mongoose";

const itemVariantSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    itemType: {
        type: String,
        required: [true, "Il tipo di prodotto è obbligatorio"],
        enum: ["coffee_capsule"], 
        index: true 
    },
    name: {
        type: String,
        require: [true, "Il nome deve variante è obbligatorio"],
        trim: true,
        maxlength: [100, "Il nome della variante non può superare i 100 caratteri"] 
    },
    sku: {
        type: String,
        trim: true,
        maxlength: [100, "Il codice sku non può superare i 100 caratteri"] 
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
    discountPrice: {
        type: Number,
        min: 0
    },
    stock: {
        quantity: {
            type: Number,
            required: [true, "La quantità disponibile del prodotto è obbligatoria"],
            min: [0, "La quantità disponibile del prodotto non può essere negativa"],
            validate: {
                validator: Number.isInteger,
                message: "La quantità disponibile del prodotto deve essere un numero intero"
            },
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    images: [{
        url: {
            type: String,
            // required: [true, "L\'URL dell'immagine è obbligatorio"],
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
        isMain: {
            type: Boolean,
            default: false
        } 
    }],
    weight: { 
        value: { 
            type: Number, 
            min: 0 
        }, 
        unit: { 
            type: String, 
            enum: ["g", "kg", "ml", "l"] 
        } 
    },
    color: { 
        type: String, 
        trim: true 
    },
    size: { 
        type: String, 
        trim: true 
    }
}, 
{ 
    timestamps: true,
    discriminatorKey: 'itemType' 
});


// ---- INDICI -----
itemVariantSchema.index({ itemId: 1, name: 1 }, { unique: true });


const ItemVariant = model("ItemVariant", itemVariantSchema);
export default ItemVariant;