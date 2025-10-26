import { model, Schema } from "mongoose";

const itemSchema = new Schema({
    name: {
        type: String,
        required: [true, "Il nome è obbligatorio"],
        unique: true,
        trim: true,
        maxlength: [100, "Il nome non può superare i 100 caratteri"] 
    },
    slug: {
        type: String,
        // unique: true,
        trim: true,
        lowercase: true
    },
    brand: {
        type: String,
        trim: true,
        maxlength: [100, "Il brand non può superare i 100 caratteri"] 
    },
    description: {
        type: String,
        trim: true,
        maxlength: [255, "La descrizione non può superare i 255 caratteri"] 
    },
    itemType: {
        type: String,
        required: [true, "Il tipo di prodotto è obbligatorio"],
        enum: ["coffee_capsule"], 
        index: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    tags: [{ 
        type: String, 
        trim: true 
    }],
    variants: [{
        type: Schema.Types.ObjectId,
        ref: "ItemVariant"
    }],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
}, 
{
    timestamps: true,
    discriminatorKey: 'itemType'
});


// ---- PRE-MIDDLEWARE (HOOKS) ---- 
// genera slug prodotto a partire da name
itemSchema.pre('save', function(next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
    }
    next();
});


// itemSchema.path('variants').validate(function(value) {
//     return value && value.length > 0;
// }, 'Fornire almeno una specifica variante vendibile.');


const Item = model("Item", itemSchema);
export default Item;