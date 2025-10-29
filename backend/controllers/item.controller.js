import mongoose from 'mongoose';
import Item from '../models/Item.js';
import ItemVariant from '../models/ItemVariant.js';
import AppError from '../utils/appError.js';
import * as factory from './factory.controller.js';
import Review from '../models/Review.js';
import { DEFAULT_PRODUCT_IMAGE_PUBLIC_ID, DEFAULT_PRODUCT_IMAGE_URL, deleteCloudinaryAsset } from '../config/cloudinary.config.js';
import multer from 'multer';
import CoffeeCapsuleItem from '../models/discriminators/CoffeeCapsuleItem.js';


// export const getAllItems = factory.getAll(Item);
export const getAllItems = async(req, res, next) => {
    const searchTerm = req.query.search;
    const searchField = req.query.searchField || 'name';
    
    const allowedSearchFields = ['name', 'description'];
    if (searchField && !allowedSearchFields.includes(searchField)) {
        return next(
            new AppError(
                `Campo di ricerca non valido. Campi permessi: ${allowedSearchFields.join(', ')}`, 
                400
            )
        );
    }

    let queryObj = {};

    if (searchTerm) {
        queryObj[searchField] = new RegExp(searchTerm, "i");
    }

    let page = parseInt(req.query.page) || 1;
    if (page < 1) page = 1;

    let perPage = parseInt(req.query.perPage) || 6;
    if (perPage < 1 || perPage > 25) perPage = 6;

    try {
        const totalCount = await Item.countDocuments(queryObj);
        const totalPages = Math.ceil(totalCount / perPage);

        const users = await Item.find(queryObj)
            .sort({ firstName: 1, lastName: 1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('variants');

        res.status(200).send({
            page,
            perPage,
            totalPages,
            totalCount,
            data: users
        });
    } catch (error) {
        next(error);
    }
}

// export const getItem = factory.getOne(Item, [{ path: 'variants reviews' }, { path : 'reviews.user'}]);
export const getItem = async (req, res, next) => {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("ID prodotto non valido", 400));
    }
    
    try {
        const item = await Item.findById(id)
        .populate('variants')
        .populate({
            path: 'reviews', 
            populate: {
                path: "user"
            }
        })
        
        if (!item) {
            return next(new AppError("Prodotto non trovato", 404));
        }

        res.status(200).json({
            status: 'success',
            data: item
        });
    } catch (error) {
        next(error);
    }
}

export const createItem = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try{
        const { variants, ...itemData } = req.body;

        if (!variants || variants.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError("Per creare il prodotto bisogna fornire almeno una specifica variante vendibile", 400));
        }

        let newItem;
        if(itemData?.itemType === 'coffee_capsule') {
            newItem = await CoffeeCapsuleItem.create([{ ...itemData, variants: [] }], { session });
        } else {
            newItem = await Item.create([{ ...itemData, variants: [] }], { session });
        }

        const createdItem = newItem[0];

        const variantPromises = variants.map(async variantData => {
            let imagesToUse = variantData.images;
            if (!imagesToUse || imagesToUse.length === 0) {
                // Se images è mancante o vuoto, usa il default
                imagesToUse = [{
                    url: DEFAULT_PRODUCT_IMAGE_URL,
                    public_id: DEFAULT_PRODUCT_IMAGE_PUBLIC_ID,
                    altText: "Nessuna immagine disponibile",
                    isMain: true
                }];
            }

            const bodyVariant = { ...variantData, item: createdItem._id, images: imagesToUse };
            const newVariant = await ItemVariant.create([bodyVariant], { session });
            return newVariant[0]._id; 
        });

        const savedVariantIds = await Promise.all(variantPromises);

        createdItem.variants = savedVariantIds;

        await createdItem.save({ session });

        await session.commitTransaction();
        session.endSession();
        
        const finalItem = await Item.findById(createdItem._id).populate('variants');
    
        res.status(201).json({
            status: 'success',
            data: finalItem
        });
    } catch(error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const updateItem = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError('ID non valido', 400));
        }
        const { variants, ...itemData } = req.body;

        let existingItem;
        if(itemData?.itemType === "coffee_capsule") {
            existingItem = await CoffeeCapsuleItem.findById(id).populate('variants').session(session);
        } else {
            existingItem = await Item.findById(id).populate('variants').session(session);
        }
        

        if (!existingItem) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError("Prodotto non trovato", 404));
        }

        Object.assign(existingItem, itemData);
        await existingItem.save({ session });
        
        const currentVariantIds = existingItem.variants.map(v => v._id.toString());
        const newOrUpdatedVariantIds = [];
        const variantsToCreate = [];
        const variantsToUpdate = [];

        if (variants && variants.length > 0) {
            variants.forEach(variantData => {
                if (variantData._id) {
                    // Variante da aggiornare
                    variantsToUpdate.push(variantData);
                    newOrUpdatedVariantIds.push(variantData._id.toString());
                } else {
                    // Variante da creare
                    variantsToCreate.push(variantData);
                }
            });
        }

        // Varianti da eliminare (quelle che erano associate all'item ma non sono più presenti nel body)
        const variantsToDeleteIds = currentVariantIds.filter(
            variantId => !newOrUpdatedVariantIds.includes(variantId)
        );

        // Elimina le varianti rimosse
        if (variantsToDeleteIds.length > 0) {
            await ItemVariant.deleteMany({ _id: { $in: variantsToDeleteIds } }, { session });
        }

        // Aggiorna le varianti esistenti
        const updateVariantPromises = variantsToUpdate.map(async variantData => {
            const variantId = variantData._id;
            const updatedVariant = await ItemVariant.findByIdAndUpdate(
                variantId,
                { ...variantData, item: existingItem._id }, // Assicurati che il riferimento all'item sia corretto
                { new: true, runValidators: true, session }
            );
            if (!updatedVariant) {
                // Questo caso dovrebbe essere raro se le validazioni sono corrette
                throw new AppError(`Variante con ID ${variantId} non trovata per l'aggiornamento`, 404);
            }
            return updatedVariant._id;
        });

        const updatedExistingVariantIds = await Promise.all(updateVariantPromises);

        // Crea le nuove varianti
        const createVariantPromises = variantsToCreate.map(async variantData => {
            const bodyVariant = { ...variantData, item: existingItem._id };
            const newVariant = await ItemVariant.create([bodyVariant], { session });
            return newVariant[0]._id;
        });

        const createdNewVariantIds = await Promise.all(createVariantPromises);

        // Aggiorna l'array variants dell'Item con i nuovi ID
        existingItem.variants = [...updatedExistingVariantIds, ...createdNewVariantIds];
        await existingItem.save({ session });

        await session.commitTransaction();
        session.endSession();

        const finalUpdatedItem = await Item.findById(id).populate('variants');

        res.status(200).json({
            status: 'success',
            data: finalUpdatedItem
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const deleteItem = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError('ID non valido', 400));
        }
        
        const itemToDelete = await Item.findById(id).session(session);

        if (!itemToDelete) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError("Prodotto non trovato per l'eliminazione", 404));
        }

        // Elimina tutte le varianti associate a questo prodotto
        await ItemVariant.deleteMany({ item: itemToDelete._id }, { session });

        // Elimina il prodotto
        await Item.findByIdAndDelete(id, { session });
        
        await session.commitTransaction();
        session.endSession();

        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const getItemVariantsByItemId = async (req, res, next) => {
    try {
        const variants = await ItemVariant.find({ item: req.params.itemId });
    
        res.status(200).json({
            status: 'success',
            results: variants.length,
            data: {
                data: variants
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getReviewsByItemId = async (req, res, next) => {
    try {
        const reviews = await Review.find({ item: req.params.itemId });
    
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: {
                data: reviews
            }
        });
    } catch (error) {
        next(error);
    }
}


export const addProductImages = async (request, response, next) => {
    try {
        const { productId, variantId } = request.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError("ID prodotto non valido.", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(variantId)) {
            return next(new AppError("ID variante non valido.", 400));
        }

        if (!request.file) {
            return next(new AppError("Nessun file immagine fornito.", 400));
        }

        // if (!request.files || request.files.length === 0) {
        //     return next(new AppError("Nessun file immagine fornito.", 400));
        // }

        const product = await Item.findById(productId);
        if (!product) {
            return next(new AppError("Prodotto non trovato.", 404));
        }

        // if (!product.variants || !Array.isArray(product.variants)) {
        //     return next(new AppError('Varianti non disponibili per questo prodotto', 404));
        // }

        const variant = await ItemVariant.findById(variantId);
        if (!variant) {
            return next(new AppError("Variante non trovata.", 404));
        }

        const { altText, isMain } = request.body;

        // const newImages = request.files.map(file => ({
        //     url: file.path,
        //     public_id: file.filename,
        //     altText: `Immagine per ${product.name}`,
        //     altText: altText || `Immagine per ${variant.name}`,
        //     isMain: isMain === 'true' || false
        // }));
        
        const newImages = {
            url: request.file.path,
            public_id: request.file.filename,
            altText: `Immagine per ${product.name}`,
            altText: altText || `Immagine per ${variant.name}`,
            isMain: isMain === 'true' || false
        }

        let currentImages = variant.images.toObject(); // Converti in JS array per manipolazione

        // Controllo se l'immagine di default se è l'unica presente
        if (currentImages.length === 1 && currentImages[0].public_id === DEFAULT_PRODUCT_IMAGE_PUBLIC_ID) {
            currentImages = [];
        }

        currentImages.push(newImages);
        // currentImages.push(...newImages);

        // Se non c'era un'immagine principale, imposta la prima come tale
        if (!currentImages.some(img => img.isMain) && currentImages.length > 0) {
            currentImages[0].isMain = true;
        }

        variant.images = currentImages;

        await variant.save(); 
        const updatedProduct = await Item.findById(productId).populate('variants')
        
        response.status(200).json({
            status: 'success',
            data:  updatedProduct
        });
    } catch (error) {
        if (error instanceof multer.MulterError) {
            return next(new AppError(`Errore di caricamento: ${error.message}`, 400));
        }
        return next(error);
    }
}


export const updateVariantImage = async (request, response, next) => {
    try {
        const { productId, variantId, imageId } = request.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError("ID prodotto non valido.", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(variantId)) {
            return next(new AppError("ID variante non valido.", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(imageId)) {
            return next(new AppError("ID immagine non valido.", 400));
        }
        
        const product = await Item.findById(productId);
        if (!product) {
            return next(new AppError("Prodotto non trovato.", 404));
        }
        
        const variant = await ItemVariant.findById(variantId);
        if (!variant) {
            return next(new AppError("Variante non trovata.", 404));
        }
        
        if (!variant.images || !Array.isArray(variant.images)) {
            return next(new AppError('Immagini non disponibili per questa variante', 404));
        }
        
        // Trova l'immagine da cancellare nell'array
        const indexImageToUpdate = variant.images.findIndex(i => i._id == imageId); 

        if(indexImageToUpdate === undefined || indexImageToUpdate < 0) {
            return next(new AppError("Indice immagine non trovato.", 404));
        }

        const imageToUpdate = variant.images[indexImageToUpdate];
        if (!imageToUpdate) {
            return next(new AppError("Immagine non trovata nel prodotto.", 404));
        }
        const  altText = request.body?.altText;
        const  isMain = request.body?.isMain;

        if (altText !== undefined) {
            imageToUpdate.altText = altText;
        }

        if (isMain !== undefined) {
            imageToUpdate.isMain = isMain;

            // const newIsMain = isMain === true || isMain === 'true';

            // if (newIsMain && !imageToUpdate.isMain) {
            //     // Se l'immagine viene impostata come principale, de-seleziona tutte le altre
            //     variant.images.forEach(img => {
            //         if (img._id.toString() !== imageId) {
            //             img.isMain = false;
            //         }
            //     });
            //     imageToUpdate.isMain = true;
            // } 
            // else if (!newIsMain && imageToUpdate.isMain && variant.images.length > 1) {
            //     // Se si sta deselezionando l'immagine principale e ci sono altre immagini,
            //     // imposta la prima altra immagine come principale (se non ce n'è già una)
            //     imageToUpdate.isMain = false;
            //     if (!variant.images.some(img => img.isMain)) {
            //         const firstOtherImage = variant.images.find(img => img._id.toString() !== imageId);
            //         if (firstOtherImage) {
            //             firstOtherImage.isMain = true;
            //         }
            //     }
            // } else if (!newIsMain && imageToUpdate.isMain && variant.images.length === 1) {
            //     // Se è l'unica immagine e si tenta di deselezionarla come principale
            //     return next(new AppError("La variante deve avere almeno un'immagine principale.", 400));
            // } else if (newIsMain && imageToUpdate.isMain) {
            //     // Già principale, non fare nulla
            // }
        }

        variant.images[indexImageToUpdate] = imageToUpdate;

        const updatedVariant = await variant.save();
        response.status(200).json({
            status: 'success',
            data: updatedVariant
        });

    } catch (error) {
        return next(error);
    }
};


export const deleteProductImage = async (request, response, next) => {
    try {
        const { productId, variantId, imageId } = request.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError("ID prodotto non valido.", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(variantId)) {
            return next(new AppError("ID variante non valido.", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(imageId)) {
            return next(new AppError("ID immagine non valido.", 400));
        }

        const product = await Item.findById(productId);
        if (!product) {
            return next(new AppError("Prodotto non trovato.", 404));
        }

        const variant = await ItemVariant.findById(variantId);
        if (!variant) {
            return next(new AppError("Variante non trovata.", 404));
        }

        if (!variant.images || !Array.isArray(variant.images)) {
            return next(new AppError('Immagini non disponibili per questa variante', 404));
        }

        // Trova l'immagine da cancellare nell'array
        const imageToDelete = variant.images.find(i => i._id == imageId); 
        if (!imageToDelete) {
            return next(new AppError("Immagine non trovata nel prodotto.", 404));
        }

        // Prevenire la cancellazione dell'immagine di default se è l'unica rimasta
        if (variant.images.length === 1 && imageToDelete.public_id === DEFAULT_PRODUCT_IMAGE_PUBLIC_ID) {
            return next(new AppError("Non puoi cancellare l'ultima immagine di default. Carica prima una nuova immagine o lascia l'immagine di default.", 400));
        }

        // Tenta di cancellare da Cloudinary
        if (imageToDelete.public_id && imageToDelete.public_id !== DEFAULT_PRODUCT_IMAGE_PUBLIC_ID) {
            try {
                await deleteCloudinaryAsset(imageToDelete.public_id);
            } catch (destroyError) {
                console.warn(`Avviso: Impossibile cancellare l'asset Cloudinary per ${imageToDelete.public_id}.`, destroyError.message);
            }
        }

        // Rimuovi il sottodocumento dall'array
        imageToDelete.deleteOne(); // Metodo di Mongoose per rimuovere sottodocumenti

        // Se l'immagine cancellata era la principale, e ci sono altre immagini,
        // imposta la prima rimanente come principale (se non ce n'è già una)
        if (imageToDelete.isMain && variant.images.length > 0 && !variant.images.some(img => img.isMain)) {
            variant.images[0].isMain = true;
        }
        // Se non ci sono più immagini dopo la cancellazione, ripristina l'immagine di default
        if (variant.images.length === 0) {
             variant.images.push({
                url: DEFAULT_PRODUCT_IMAGE_URL,
                public_id: DEFAULT_PRODUCT_IMAGE_PUBLIC_ID,
                altText: "Nessuna immagine disponibile",
                isMain: true
            });
        }


        const updatedVariant = await variant.save();

        response.status(200).json({
            status: 'success',
            data: updatedVariant
        });
    } catch (error) {
        return next(error);
    }
}