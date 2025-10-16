import passport from "passport";
import express from "express";
import morgan from "morgan";
import cors from 'cors'; 
import 'dotenv/config'; 

import { connectDB } from "./db.js";
import AppError from "./utils/appError.js";
import strategyGoogle from "./config/passport.config.js";
import globalErrorHandler from "./middlewares/errorMiddleware.js";

import authenticationRouter from "./routers/authentication.router.js";
import userRouter from "./routers/user.router.js";
import itemRouter from "./routers/item.router.js";
import itemVariantRouter from "./routers/itemVariant.router.js";
import reviewRouter from "./routers/review.router.js";
import orderRouter from "./routers/order.router.js";
import cartRouter from "./routers/cart.router.js";

const server = express();
const apiV1Router = express.Router();
const port = process.env.PORT;

server.use(cors());

if (process.env.NODE_ENV === 'development') {
    server.use(morgan('dev'));
}

server.use(express.json()); 

passport.use(strategyGoogle);

apiV1Router.use("/auth", authenticationRouter);
apiV1Router.use("/users", userRouter);
apiV1Router.use("/items", itemRouter);
// apiV1Router.use("/item-variants", itemVariantRouter);
apiV1Router.use("/reviews", reviewRouter);
apiV1Router.use("/orders", orderRouter);
apiV1Router.use("/cart", cartRouter);

server.use("/api/v1", apiV1Router);
    
// Gestione di route non trovate (404)
server.all('/{*any}', (req, res, next) => {
    next(new AppError(`Risorsa ${req.originalUrl} non trovata su questo server!`, 404));
});

server.use(globalErrorHandler);

await connectDB();

server.listen(port, () => {
    // console.clear();
    console.log("Server avviato sulla porta ", port)
})