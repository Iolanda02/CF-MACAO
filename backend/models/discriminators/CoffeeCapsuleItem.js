import { Schema } from "mongoose";
import Item from "../Item.js";

const coffeeCapsuleItemSchema = new Schema({
    intensity: {
        type: Number,
        min: 0,
        max: 12,
        validate: {
            validator: Number.isInteger,
            message: 'L\'intensità deve essere un numero intero'
        }
    },
    roastLevel: {
        type: String,
        enum: ["Light", "Medium", "Dark", "Extra Dark"],
        default: "Medium"
    },
    blend: {
        type: String,
        trim: true,
        maxlength: [100, "La miscela non può superare i 100 caratteri"]
    },
    aromaProfile: {
        type: String,
        trim: true,
        maxlength: [255, "Il profilo aromatico non può superare i 255 caratteri"]
    },
    systemCompatibility: [{
        type: String,
        trim: true,
        maxlength: [100, "Il sistema compatibile non può superare i 100 caratteri"]
    }],
    // capsulePerPack: {
    //     type: Number,
    //     min: [1, "La confezione deve contenere almeno 1 capsula"],
    //     validate: {
    //         validator: Number.isInteger,
    //         message: "Il valore di capsule per confezione deve essere un numero intero"
    //     }
    // }
})

const CoffeeCapsuleItem = Item.discriminator("coffee_capsule", coffeeCapsuleItemSchema);
export default CoffeeCapsuleItem;