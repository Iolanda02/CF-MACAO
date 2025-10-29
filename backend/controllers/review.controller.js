import mongoose from 'mongoose';
import Review from '../models/Review.js';
import AppError from '../utils/appError.js';
import * as factory from './factory.controller.js';
import Item from '../models/Item.js';


export const getAllReviews = factory.getAll(Review);

export const getReview = factory.getOne(Review, { path: 'item user' });

export const createReview = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("ID utente non valido", 400))
    }

    const { item, rating, comment } = req.body;
    if (!item || !mongoose.Types.ObjectId.isValid(item)) {
        return next(new AppError('ID prodotto non valido', 400));
    }
    
    if (!item || !rating) {
        return next(new AppError('Item e rating sono campi obbligatori', 400));
    }
    
    if (rating && (rating < 1 || rating > 5)) {
        return next(new AppError('Il rating deve essere compreso tra 1 e 5', 400));
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Controlla se t'utente ha già recensito questo articolo
        // const existingReview = await Review.findOne({ item: item, user: user });
        // if (existingReview) {
        //     return res.status(409).json({ message: 'Hai già recensito questo prodotto.' });
        // }

        const newReview = new Review({
            item,
            user: userId,
            rating,
            comment
        });

        const savedReview = await newReview.save({ session });

        const existingItem = await Item.findById(item).populate('reviews').session(session);
        
        if (!existingItem) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError("Prodotto non trovato", 404));
        }

        existingItem.reviews.push(savedReview._id);
        await existingItem.save({ session });

        await session.commitTransaction();
        session.endSession();

        const populatedReview = await savedReview.populate('user'); 
        
        res.status(201).json({
            status: 'success',
            data: populatedReview
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const updateReview = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("ID utente non valido", 400))
    }

    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('ID commento non valido', 400));
    }

    const { rating, comment } = req.body;
    
    if (rating && (rating < 1 || rating > 5)) {
        return next(new AppError('Il rating deve essere compreso tra 1 e 5', 400));
    }

    const updateFields = {};
    if (rating !== undefined) {
        updateFields.rating = rating;
    }
    if (comment !== undefined) {
        updateFields.comment = comment;
    }
    
    try {
        const existingReview = await Review.findOne({ _id: id, user: userId });
        
        if (!existingReview) {
            return next(new AppError('Recensione non trovata o non autorizzato ad aggiornarla', 404));
        }
        
        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );
        
        if (!updatedReview) {
            return next(new AppError('Recensione non trovata', 404));
        }
        
        const populatedReview = await updatedReview.populate('user'); 

        res.status(200).json({
            status: 'success',
            data: populatedReview
        });

    } catch (error) {
        next(error);
    }
}

export const deleteReview = async(req, res, next) => {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("ID utente non valido", 400))
    }
    
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('ID commento non valido', 400));
    }

    try {
        const reviewToDelete = await Review.findOneAndDelete({ _id: id });

        if (!reviewToDelete) {
            return next(new AppError('Recensione non trovata o non autorizzato ad eliminarla', 404));
        }
        
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
}