import 'dotenv/config'; 
import mongoose from 'mongoose';
import { seedAdminUser } from './scripts/seedAdmin.js';

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_URI);
        console.log("DB Connesso!");

        if (process.env.RUN_SEED_ADMIN_ON_STARTUP === 'true') {
            await seedAdminUser();
        }
    } catch(error){
        console.error('Errore di connessione a MongoDB o seeding admin:', error);
        process.exit(1);
    }
}