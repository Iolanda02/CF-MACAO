import { htmlToText } from "html-to-text";
import { generateJWT } from "../helpers/jwt.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import mailer from "../helpers/mailer.js";


export async function register(request, response, next) {
    const { email, password, firstName, lastName, phone } = request.body;
    // let insertedUser;

    try {
        if (!email || !password || !firstName || !lastName) {
            return next(new AppError('Email, password, nome e cognome sono richiesti.', 400));
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
    
        if (existingUser) return next(new AppError('Utente già registrato', 409));
    
        // const hashedPassword = await bcrypt.hash(password, 10);
    
        const insertedUser = await User.create({ ...request.body});
    
        response.status(201).send({ 
            status: 'success',
            message: 'Registrazione avvenuta con successo. Ti abbiamo inviato una email di benvenuto!' 
        });
    } catch(error) {
        next(error);
    }

    try{
        // Invio email di benvenuto all'utente
        const welcomeHtmlContent = `
            Benvenuto nel mondo di Caffè Macao, ${firstName}!
            <p>Siamo entusiasti di darti il benvenuto nella nostra famiglia di amanti del buon caffè.</p>
            <p>Ora che fai parte della nostra community, sei a un solo click dalle migliori selezioni di cialde e capsule, pensate per regalarti ogni giorno un'esperienza di gusto unica.</p>
            <p><a href="${process.env.FRONTEND_HOST}/login">Inizia il tuo viaggio nel Gusto</a></p>
            <p>Preparati a trasformare ogni pausa caffè in un momento di puro piacere.</p>
            <p>A presto, e buon caffè!</p>
            <p>Lo staff di Caffè Macao</p>
            <br><br>
            <p>Hai domande? Contattaci o visita le nostre <a href="${process.env.FRONTEND_HOST}/faq">FAQ</a>.</p>
            <p>&copy; ${new Date().getFullYear()} Caffè Macao. Tutti i diritti riservati.</p>
        `;

        await mailer.sendMail({
            from: {
                name: 'Caffè Macao',
                address: process.env.EMAIL_SYSTEM_USER,
            },
            to: email,
            subject: 'Benvenuto in Caffè Macao',
            text: htmlToText(welcomeHtmlContent),
            html: welcomeHtmlContent,
        });

        // Invio email di notifica all'admin 
        const adminNotificationHtmlContent = `
            <p>Un nuovo utente si è registrato:</p>
            <ul>
                <li>Nome: ${firstName}</li>
                <li>Cognome: ${lastName}</li>
                <li>Email: ${email}</li>
            </ul>
            <p>Data di registrazione: ${new Date().toLocaleString()}</p>
            <br><br>
            <p> Contenuto mail per utente </p>
            <p>Benvenuto nel mondo di Caffè Macao, ${firstName}!</p>
            <p>Siamo entusiasti di darti il benvenuto nella nostra famiglia di amanti del buon caffè.</p>
            <p>Ora che fai parte della nostra community, sei a un solo click dalle migliori selezioni di cialde e capsule, pensate per regalarti ogni giorno un'esperienza di gusto unica.</p>
            <p><a href="${process.env.FRONTEND_HOST}/login">Inizia il tuo viaggio nel Gusto</a></p>
            <p>Preparati a trasformare ogni pausa caffè in un momento di puro piacere.</p>
            <p>A presto, e buon caffè!</p>
            <p>Lo staff di Caffè Macao</p>
            <br><br>
            <p>Hai domande? Contattaci o visita le nostre <a href="${process.env.FRONTEND_HOST}/faq">FAQ</a>.</p>
            <p>&copy; ${new Date().getFullYear()} Caffè Macao. Tutti i diritti riservati.</p>
        `;

        await mailer.sendMail({
            from: {
                name: 'Notifiche Caffè Macao',
                address: process.env.EMAIL_SYSTEM_USER,
            },
            to: process.env.ADMIN_EMAIL,
            subject: 'Nuovo Utente Registrato in Caffè Macao',
            text: htmlToText(adminNotificationHtmlContent),
            html: adminNotificationHtmlContent,
        });
    } catch(error) {
        console.log(error);
    }
}


export async function login(request, response, next) {
    const { email, password } = request.body;

    if (!email || !password) {
        return next(new AppError('Si prega di fornire email e password', 400));
    }

    const userByEmail = await User.findOne({email}).select('+password');

    if (!userByEmail || !(await userByEmail.comparePassword(password))) {
        return next(new AppError('Email o password non validi', 401));
    }

    const jwt = await generateJWT({id: userByEmail._id});

    return response.status(200).json({
        status: 'success',
        token: jwt,
        data: {
            user: userByEmail
        }
    });
}