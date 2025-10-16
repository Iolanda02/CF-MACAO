import 'dotenv/config'; 
import bcrypt from 'bcrypt';
import User from '../models/User.js';

export async function seedAdminUser() {

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFirstName = process.env.ADMIN_FIRST_NAME;
    const adminLastName = process.env.ADMIN_LAST_NAME;
    const adminPhone = process.env.ADMIN_PHONE;

    try {
        // Controlla se esiste già un utente admin con questa email
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`L'utente admin con email ${adminEmail} esiste già.`);
            if (process.env.UPDATE_EXISTING_ADMIN === 'true') {
                existingAdmin.password = adminPassword;
                await existingAdmin.save();
                console.log(`Utente admin ${adminEmail} aggiornato.`);
            }
            return;
        }

        const newAdmin = await User.create({
            email: adminEmail,
            password: adminPassword,
            firstName: adminFirstName,
            lastName: adminLastName,
            phone: adminPhone,
            role: 'admin',
        });

        console.log(`Utente admin ${newAdmin.email} creato con successo!`);
    } catch (error) {
        console.error('Errore durante la creazione dell\'utente admin:', error.message);
        if (error.name === 'ValidationError') {
            for (let field in error.errors) {
                console.error(`- ${field}: ${error.errors[field].message}`);
            }
        }
        throw error;
    } 
}