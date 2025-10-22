import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/dztq95r7a/image/upload/v1761068620/avatar_sy3bcl.png';
export const DEFAULT_AVATAR_PUBLIC_ID = 'avatar_sy3bcl';
export const DEFAULT_PRODUCT_IMAGE_URL = 'https://res.cloudinary.com/dztq95r7a/image/upload/v1761094004/default_capsule_flyz8q.jpg';
export const DEFAULT_PRODUCT_IMAGE_PUBLIC_ID = 'default_capsule_flyz8q';

/**
 * Funzione helper per cancellare una risorsa da Cloudinary.
 * @param {string} publicId Il public_id della risorsa da cancellare.
 * @returns {Promise<any>} Il risultato della cancellazione da Cloudinary.
 */
export async function deleteCloudinaryAsset(publicId) {
    if (!publicId || publicId === DEFAULT_AVATAR_PUBLIC_ID || publicId === DEFAULT_PRODUCT_IMAGE_PUBLIC_ID) {
        return Promise.resolve({ result: 'skipped - public_id non valido o default' });
    }
    try {
        const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
        return result;
    } catch (error) {
        console.error(`Errore durante la cancellazione dell'asset ${publicId} da Cloudinary:`, error);
        throw new Error(`Impossibile cancellare l'asset da Cloudinary: ${error.message}`);
    }
}

export { cloudinary };