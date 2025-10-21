import express from "express";
import {  addAvatarUser, createUser, getAllUsers, getUser, putUser, removeUser } from "../controllers/user.controllers.js";
import { uploadCloudinary } from "../middlewares/uploadCloudinary.js";
import { authorizeOwner, authorizeOwnerOrAdmin, protect, restrictTo } from "../middlewares/authentication.js";
import User from "../models/User.js";

const userRouter = express.Router();

userRouter.post("/", createUser);

userRouter.use(protect);

userRouter.get("/", restrictTo('admin'), getAllUsers);

userRouter.get("/:id", authorizeOwnerOrAdmin(User, 'id', '_id'), getUser);

userRouter.put("/:id", authorizeOwnerOrAdmin(User, 'id', '_id'), putUser);

userRouter.delete("/:id", authorizeOwnerOrAdmin(User, 'id', '_id'), removeUser);

userRouter.patch("/:id/avatar", 
    authorizeOwner(User, 'id', '_id'), 
    uploadCloudinary.single('avatar'), 
    addAvatarUser
);

export default userRouter;