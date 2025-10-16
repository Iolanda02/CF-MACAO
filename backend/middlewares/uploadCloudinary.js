import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storageCloudinary = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'macao/avatars',
        format: async (req, file) => 'png',
        public_id: (req, file) => `avatar_${req.params.id}_${Date.now()}`
    },
});

const uploadCloudinary = multer({ 
    storage: storageCloudinary,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite di 5MB 
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo di file non supportato. Sono ammessi solo JPEG, PNG e GIF.'), false);
        }
    }
});

export { cloudinary, uploadCloudinary };