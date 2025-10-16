import jwt from 'jsonwebtoken';
import 'dotenv/config';

export function generateJWT(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRESIN },
            (error, token) => {
                if (error) reject(error);
                else resolve(token);
            }
        );
    });
}

export function verifyJWT(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
            if (error) reject(error);
            else resolve(payload);
        });
    });
}