import express from "express";
import { login, register } from "../controllers/authentication.controller.js";
import passport from "passport";

const authenticationRouter = express.Router();

authenticationRouter.post('/register', register);

authenticationRouter.post("/login", login);

authenticationRouter.get('/login-google', passport.authenticate('google', 
    {scope: ['profile', 'email']}));

authenticationRouter.get('/callback-google',
    passport.authenticate('google', 
        { failureRedirect: '/login-failure', session: false }
    ),
    (request, response, next) => {
        console.log(request.user)
        response.redirect(
            process.env.FRONTEND_HOST +
            process.env.OAUTH_PATH_FRONTEND +
            '?jwt=' +
            request.user.jwt
        );
    }
);

authenticationRouter.get('/login-failure', (req, res) => {
    res.redirect(process.env.FRONTEND_HOST + process.env.OAUTH_PATH_FRONTEND + '?error=login_failed');
});

export default authenticationRouter;