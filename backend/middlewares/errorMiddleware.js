import AppError from "../utils/appError.js";

const handleCastErrorDB = err => {
    const message = `Dato ${err.path}: ${err.value} non valido.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const value = err.keyValue ? Object.values(err.keyValue)[0] : 'valore sconosciuto';
    const message = `Campo duplicato: ${value}. Per favore, usa un altro valore.`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Dati di input non validi. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Token non valido. Accedi di nuovo.', 401);

const handleJWTExpiredError = () => new AppError('Il tuo token è scaduto. Accedi di nuovo.', 401);


const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Errori operazionali creati internamente
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Errori di programmazione o sconosciuti
        console.error('ERRORE: ', err);
        res.status(500).json({
            status: 'error',
            message: 'Qualcosa è andato storto!'
        });
    }
};

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = { ...err, name: err.name, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else if(process.env.NODE_ENV === 'production') {
        sendErrorProd(error, res);
    }
}

export default globalErrorHandler;