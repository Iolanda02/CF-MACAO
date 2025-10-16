import { Schema } from "mongoose";

const addressSchema = new Schema({
    address: {
        type: String,
        trim: true,
        maxlength: [100, "L\'indirizzo non può superare i 100 caratteri"] 
    },
    city: {
        type: String,
        trim: true,
        maxlength: [50, "La città non può superare i 50 caratteri"] 
    },
    state: {
        type: String,
        trim: true,
        maxlength: [50, "La provincia non può superare i 50 caratteri"] 
    },
    postalCode: {
        type: String,
        trim: true,
        maxlength: [10, "Il codice postale non può superare i 10 caratteri"] 
    },
    country: {
        type: String,
        trim: true,
        maxlength: [50, "Il paese non può superare i 50 caratteri"],
        default: 'Italia' 
    },
}, {_id: false});

export default addressSchema;