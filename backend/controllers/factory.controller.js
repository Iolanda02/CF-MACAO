import mongoose from "mongoose";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const getAll = Model => catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const doc = await features.query;

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data:  doc
    });
});

export const getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('ID non valido', 400));
    }

    let query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
        return next(new AppError('Nessun documento trovato con quell\'ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

export const createOne = Model => async (req, res, next) => {
    try{
        const doc = await Model.create(req.body);
    
        res.status(201).json({
            status: 'success',
            data: doc
        });
    } catch(error) {
        next(error);
    }
};

export const updateOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('ID non valido', 400));
    }

    const doc = await Model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('Nessun documento trovato con quell\'ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

export const deleteOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('ID non valido', 400));
    }

    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
        return next(new AppError('Nessun documento trovato con quell\'ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});