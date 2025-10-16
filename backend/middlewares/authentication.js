import { verifyJWT } from '../helpers/jwt.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

export async function protect(request, response, next) {
    let token;

    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
        token = request.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Non sei loggato! Per favore, effettua il login per accedere.', 401));
    }

    let payload;
    try {
        payload = await verifyJWT(token);
    } catch (error) {
        return next(new AppError('Token non valido o scaduto. Per favore, effettua il login di nuovo.', 401))
    }

    try {
        const authUser = await User.findById(payload.id);
        if (!authUser) {
            return next(new AppError('L\'utente a cui appartiene questo token non esiste più.', 401));
        }

        // aggiungo l'utente alla request
        request.user = authUser;
        next();
    } catch (error) {
        next(error);
    }
}


export function restrictTo(...roles) {
    return (request, response, next) => {
        if (!request.user || !roles.includes(request.user.role)) {
            return next(new AppError('Non hai il permesso di accedere a questa risorsa.', 403));
        }
        next();
    };
};


export const authorizeOwner = (model, idParamName = 'id', ownerField = 'user') => async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return next(new AppError('Nessun utente autenticato trovato', 401));
        }

        const resourceId = req.params[idParamName];
        if (!resourceId) {
            return next(new AppError(`Manca ${idParamName} tra i parametri`, 400));
        }

        const resource = await model.findById(resourceId);

        if (!resource) {
            return next(new AppError(`Risorsa non trovata`, 400));
        }

        const actualOwnerId = getOwnerIdFromField(resource, ownerField);

        if (!actualOwnerId || actualOwnerId !== req.user.id.toString()) {
            return next(new AppError(`Non hai l'autorizzazione per accedere a questa risorsa`, 403));
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware factory per autorizzare l'accesso a una risorsa solo al proprietario
 * o a un utente con ruolo 'admin'.
 *
 * Questo middleware verifica:
 * 1. Che l'utente sia autenticato e che il suo ID e ruolo siano disponibili in `req.user`.
 * 2. Se l'utente è un 'admin', gli viene concesso l'accesso immediatamente.
 * 3. Altrimenti, verifica che l'ID dell'utente autenticato corrisponda all'ID del proprietario
 *    memorizzato nel campo specificato della risorsa.
 *
 * @param {import('mongoose').Model<any>} model - Il Mongoose Model della risorsa da controllare (es. User, Post).
 * @param {string} [idParamName='id'] - Il nome del parametro URL che contiene l'ID della risorsa (es. 'id', 'postId').
 * @param {string} [ownerField='user'] - Il nome del campo nel documento della risorsa che memorizza
 *   l'ID (o il riferimento) dell'utente proprietario (es. 'user', 'author', '_id').
 *   Si assume che `getOwnerIdFromField` sia disponibile per estrarre l'ID corretto.
 * @returns {import('express').RequestHandler} - Un middleware Express asincrono che gestisce l'autorizzazione.
 *
 * @throws {AppError} 401 - Se l'utente non è autenticato o mancano le informazioni dell'utente.
 * @throws {AppError} 400 - Se manca l'ID della risorsa nei parametri URL o la risorsa non è trovata.
 * @throws {AppError} 403 - Se l'utente non è il proprietario della risorsa e non è un admin.
 * @throws {Error} 500 - Per errori generici del server durante il processo.
 */
export const authorizeOwnerOrAdmin = (model, idParamName = 'id', ownerField = 'user') => async (req, res, next) => {
    try {
        if (!req.user || !req.user.id || !req.user.role) {
            return next(new AppError('Nessun utente autenticato o ruolo trovato', 401));
        }

        if (req.user.role === 'admin') {
        return next();
        }

        const resourceId = req.params[idParamName];
        if (!resourceId) {
            return next(new AppError(`Manca ${idParamName} tra i parametri`, 400));
        }

        const resource = await model.findById(resourceId);

        if (!resource) {
            return next(new AppError(`Risorsa non trovata`, 400));
        }

        const actualOwnerId = getOwnerIdFromField(resource, ownerField);

        if (!actualOwnerId || actualOwnerId !== req.user.id.toString()) {
            return next(new AppError(`Non hai l'autorizzazione per accedere a questa risorsa`, 403));
        }

        next();
    } catch (error) {
        next(error);
    }
};


// Funzione helper per estrarre l'ID del proprietario da un campo
const getOwnerIdFromField = (resource, ownerField) => {
    const owner = resource[ownerField];
    // Nessun proprietario definito
    if (!owner) return null; 

    // Se è un ObjectId (non popolato)
    if (owner._id === undefined && owner.toString) {
        return owner.toString();
    }

    // Se è un oggetto popolato (contiene l'ID come _id)
    if (owner._id && owner._id.toString) {
        return owner._id.toString();
    }

    // Se è già una stringa o un numero
    if (typeof owner === 'string' || typeof owner === 'number') {
        return owner.toString();
    }

    return null;
};