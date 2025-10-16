import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import addressSchema from "./sub-schemas/Address.js";

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "L\'email è obbligatoria"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: props => `${props.value} non è un'email valida`
        }
    },
    password: {
        type: String,
        required: [true, "La password è obbligatoria"],
        minlength: [8, "La password deve contenere almeno 8 caratteri"],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    firstName: {
        type: String,
        required: [true, "Il nome è obbligatorio"],
        trim: true,
        minlength: [2, "Il nome deve contenere almeno 2 caratteri"],
        maxlength: [50, "Il nome non può superare i 50 caratteri"] 
    },
    lastName: {
        type: String,
        required: [true, "Il cognome è obbligatorio"],
        trim: true,
        minlength: [2, "Il cognome deve contenere almeno 2 caratteri"],
        maxlength: [50, "Il cognome non può superare i 50 caratteri"]
    },
    phone: {
        type: String,
        // required: [true, "Il numero di telefono è obbligatorio"],
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
    birthDate: {
        type: Date,
        validate: {
            validator: function(v) {
                if(!v) return true;
                return v <= new Date();
                // const today = new Date();
                // const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                // return v <= eighteenYearsAgo;
            },
            message: "La data di nascita non può essere nel futuro"
            // message: "L'utente deve avere almeno 18 anni"
        }
    },
    avatar: {
        type: {
            url: {
                type: String,
                trim: true,
                default: 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg',
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
            }
        },
        _id: false,
        default: {
            url: 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg',
            public_id: null
        }
    },
    googleId: String,
    shippingAddress: {
        type: addressSchema,
        required: false
    }
}, 
{
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



// ---- PRE-MIDDLEWARE (HOOKS) ---- 
// hash della password prima di salvare
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(error) {
        next(error);
    }
})



// ---- POST-MIDDLEWARE ----
// registra che un nuovo documento è stato salvato
userSchema.post('save', function(doc, next) {
    console.log(`Un nuovo utente è stato salvato: ${doc.email}`);
    next();
});



// ---- METODI D'ISTANZA ----- 
// Confronta la password inserita con quella hashata
userSchema.methods.comparePassword = async function(candidatePassword) {
    console.log("password: ", this.password);
    return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.methods.getAvatarUrl = function() {
    return this.avatar.url;
};



// ---- VIRTUALI ----
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});



// ---- INDICI -----
userSchema.index({ role: 1 });
userSchema.index({ firstName: 1, lastName: 1 });



const User = model("User", userSchema);
export default User;