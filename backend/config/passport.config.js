import GoogleStrategy from 'passport-google-oauth20';
import { generateJWT } from '../helpers/jwt.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

const strategyGoogle = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_HOST}:${process.env.PORT}${process.env.GOOGLE_CALLBACK_PATH}`,
    },
    async function (accessToken, refreshToken, profile, cb) {
        try {
            let auth = await User.findOne({ googleId: profile.id });
            if (!auth) {
                let existingUserByEmail = await User.findOne({ email: profile._json.email });

                if (existingUserByEmail) {
                    if(!existingUserByEmail.googleId) {
                        existingUserByEmail.googleId = profile.id;
                        await existingUserByEmail.save();
                        auth = existingUserByEmail;
                    } else {
                        // Error di conflitto: esiste un utente con la stessa email e con un Google ID diverso
                        return cb(new AppError('Account già esistente con questa email tramite Google o altro provider.', 409), null);
                    }
                } else {
                    auth = await User.create({
                        firstName: profile._json.given_name,
                        lastName: profile._json.family_name,
                        email: profile._json.email,
                        avatar: profile._json.picture
                            ? { url: profile._json.picture,
                                public_id: profile._json.picture
                            }
                            : null,
                        googleId: profile.id,
                    });
                }
            } 

            const jwt = await generateJWT({ userId: auth.id });
            cb(null, { jwt });
        } catch (error) {
            console.error('Errore durante l\'autenticazione Google:', error);
            const appError = error instanceof AppError
                ? error
                : new AppError('Errore generico durante l\'autenticazione con Google.', 500);
            cb(appError, null);
        }
    }
);

export default strategyGoogle;