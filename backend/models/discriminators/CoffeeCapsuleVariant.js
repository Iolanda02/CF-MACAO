import { Schema } from "mongoose";
import ItemVariant from "../ItemVariant.js";

const coffeeCapsuleVariantSchema = new Schema({
    capsulePerPack: {
        type: Number,
        required: [true, "Il numero di capsule per confezione è obbligatorio"],
        min: [1, "La confezione deve contenere almeno 1 capsula"],
        validate: {
            validator: Number.isInteger,
            message: "Il valore di capsule per confezione deve essere un numero intero"
        }
    }
})

const CoffeeCapsuleVariant = ItemVariant.discriminator("coffee_capsule", coffeeCapsuleVariantSchema);
export default CoffeeCapsuleVariant;