import mongoose from 'mongoose';
import Item from '../models/Item.js';
import ItemVariant from '../models/ItemVariant.js';
import AppError from '../utils/appError.js';
import * as factory from './factory.controller.js';
import Review from '../models/Review.js';


export const getAllItems = factory.getAll(Item);

export const getItem = factory.getOne(Item, { path: 'variants reviews' });

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

        const newItem = await Item.create([{ ...itemData, variants: [] }], { session });
        const createdItem = newItem[0];

        const variantPromises = variants.map(async variantData => {
            const bodyVariant = { ...variantData, item: createdItem._id };
            const newVariant = await ItemVariant.create([bodyVariant], { session });
            return newVariant[0]._id; 
        });

        const savedVariantIds = await Promise.all(variantPromises);

        createdItem.variants = savedVariantIds;

        await createdItem.save({ session });

        await session.commitTransaction();
        session.endSession();
    
        res.status(201).json({
            status: 'success',
            data: createdItem
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
        
        const existingItem = await Item.findById(id).populate('variants').session(session);

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