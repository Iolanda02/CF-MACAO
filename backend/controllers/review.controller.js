import mongoose from 'mongoose';
import Review from '../models/Review.js';
import AppError from '../utils/appError.js';
import * as factory from './factory.controller.js';


export const getAllReviews = factory.getAll(Review);

export const getReview = factory.getOne(Review, { path: 'item user' });

export const createReview = async (req, resizeBy, next) => {
    const { item, rating, comment } = req.body;
    if (!mongoose.Types.ObjectId.isValid(item)) {
        return next(new AppError('ID prodotto non valido', 400));
    }
    const user = req.user._id;
    
    if (!item || !rating) {
        return next(new AppError('Item e rating sono campi obbligatori', 400));
    }
    
    if (rating && (rating < 1 || rating > 5)) {
        return next(new AppError('Il rating deve essere compreso tra 1 e 5', 400));
    }
    
    try {
        // Controlla se t'utente ha già recensito questo articolo
        // const existingReview = await Review.findOne({ item: item, user: user });
        // if (existingReview) {
        //     return res.status(409).json({ message: 'Hai già recensito questo prodotto.' });
        // }

        const newReview = new Review({
            item,
            user,
            rating,
            comment
        });

        const savedReview = await newReview.save();
        
        res.status(201).json({
            status: 'success',
            data: savedReview
        });
    } catch (error) {
        next(error);
    }
}

export const updateReview = async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("ID recensione non valido", 400))
    }

    const { rating, comment } = req.body;
    const user = req.user._id;
    
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
        const existingReview = await Review.findOne({ _id: id, user: user });
        
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

        res.status(200).json({
            status: 'success',
            data: updatedReview
        });

    } catch (error) {
        next(error);
    }
}

export const deleteReview = async(req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("ID recensione non valido", 400))
    }
    const user = req.user._id;

    try {
        const reviewToDelete = await Review.findOneAndDelete({ _id: id, user: user });

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