import mongoose from "mongoose";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { cloudinary } from "../middlewares/uploadCloudinary.js";


export async function getAllUsers(request, response, next) {
    const searchTerm = request.query.search;
    const searchField = request.query.searchField || 'email';
    
    const allowedSearchFields = ['username', 'email', 'firstName', 'lastName'];
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

    let page = parseInt(request.query.page) || 1;
    if (page < 1) page = 1;

    let perPage = parseInt(request.query.perPage) || 3;
    if (perPage < 1 || perPage > 25) perPage = 10;

    try {
        const totalCount = await User.countDocuments(queryObj);
        const totalPages = Math.ceil(totalCount / perPage);

        const users = await User.find(queryObj)
            .sort({ firstName: 1, lastName: 1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        response.status(200).send({
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

export async function getUser(request, response, next) {
    try {
        const {id} = request.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return next(new AppError('L\'ID utente fornito non è valido.', 400));
        }
        const user = await User.findById(id);

        if(!user) {
            return next(new AppError('Utente non trovato con l\'ID specificato.', 404));
        }
        
        response.status(200).json({
            status: 'success',
            data: user
        });
    } catch(error) {
        next(error);
    }
}

export async function createUser(request, response, next) {
    try {
        const {
            email, password, firstName, lastName, phone, 
            birthDate, avatar, shippingAddress
        } = request.body;

        const newUser = await User.create({
            email, password, firstName, lastName, phone,
            birthDate, avatar, shippingAddress,
        });

        response.status(201).json({ 
            status: 'success',
            data: {
                user: newUser
            }
        });
    } catch(error) {
        next(error);
    }
}

export async function putUser(request, response, next) {
    try {
        const {id} = request.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return next(new AppError('L\'ID utente fornito non è valido.', 400));
        }

        const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'birthDate', 'avatar', 'shippingAddress'];
        const updateData = {};
        
        Object.keys(request.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = request.body[key];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return next(new AppError('Nessun campo valido fornito per l\'aggiornamento dell\'utente.', 400));
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData,
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            return next(new AppError('Utente non trovato con l\'ID specificato.', 404));
        }

        response.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch(error) {
        next(error);
    }
}

export async function removeUser(request, response, next) {
    try {
        const {id} = request.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return next(new AppError('L\'ID utente fornito non è valido.', 400));
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return next(new AppError('Utente non trovato con l\'ID specificato per la cancellazione.', 404));
        }

        response.status(204).send();
    } catch(error) {
        next(error);
    }
}

export async function addAvatarUser(request, response, next) {
    try {
        const { id } = request.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { 
            return next(new AppError("ID autore non valido.", 400));
        }

        if (!request.file) {
            return next(new AppError("Nessun file avatar fornito.", 400));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(new AppError("Autore non trovato.", 404));
        }

        // Se esiste un vecchio avatar lo cancello da Cloudinary
        if (user.avatar && user.avatar.public_id) {
            try {
                await cloudinary.uploader.destroy(
                    user.avatar.public_id,
                    { invalidate: true }
                );
                // console.log(`Vecchio avatar ${user.avatar.public_id} cancellato con successo.`);
            } catch (destroyError) {
                // Non blocco il processo se la cancellazione fallisce, ma loggo l'errore
                console.error(`Errore durante la cancellazione del vecchio avatar ${user.avatar.public_id}:`, destroyError);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                avatar: {
                    url: request.file.path,
                    public_id: request.file.filename
                }
            },
            { new: true, runValidators: true }
        );

        response.status(200).json({
            status: 'success',
            data: {
                author: updatedUser
            }
        });
    } catch (error) {
        if (error instanceof multer.MulterError) {
            return next(new AppError(error.message, 400));
        }
        if (error.message.includes('Tipo di file non supportato')) {
            return next(new AppError(error.message, 400));
        }
        return next(error);
    }
}