import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.config.js';

// Funzione comune per filtrare i file (solo immagini)
const imageFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo di file non supportato. Sono ammessi solo JPEG, PNG e GIF.'), false);
    }
};


// --- Configurazione per Avatars (cartella macao/avatars) ---
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'macao/avatars',
        format: async (req, file) => 'png',
        public_id: (req, file) => `avatar_${req.params.id || Date.now()}`,
        // transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }]
    },
});

export const uploadUserAvatar= multer({ 
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite di 5MB 
    fileFilter: imageFileFilter
});


// --- Configurazione per Immagini di Prodotto (cartella macao/products) ---
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'macao/products',
        format: async (req, file) => 'png',
        public_id: (req, file) => `product_${req.params.productId}_${Date.now()}`,
        // transformation: [{ width: 800, height: 600, crop: "limit" }]
        
    },
    // params: async (req, file) => {
    //     return {
    //         folder: 'macao/products',
    //         format: async (req, file) => 'png',
    //         public_id: (req, file) => `product_${req.params.productId}_${Date.now()}`,
    //         // transformation: [{ width: 800, height: 600, crop: "limit" }]
    //     }
    // },
});

export const uploadProductImage = multer({
    storage: productStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: imageFileFilter,
});