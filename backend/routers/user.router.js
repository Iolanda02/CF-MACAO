import express from "express";
import {  addAvatarUser, createUser, deleteAvatarUser, getAllUsers, getUser, putUser, removeUser } from "../controllers/user.controllers.js";
import { authorizeOwner, authorizeOwnerOrAdmin, protect, restrictTo } from "../middlewares/authentication.js";
import User from "../models/User.js";
import { uploadUserAvatar } from "../middlewares/uploadCloudinary.js";

const userRouter = express.Router();

userRouter.post("/", createUser);

userRouter.use(protect);

userRouter.get("/", restrictTo('admin'), getAllUsers);

userRouter.get("/:id", authorizeOwnerOrAdmin(User, 'id', '_id'), getUser);

userRouter.put("/:id", authorizeOwnerOrAdmin(User, 'id', '_id'), putUser);

userRouter.delete("/:id", authorizeOwnerOrAdmin(User, 'id', '_id'), removeUser);

userRouter.patch("/:id/avatar", 
    authorizeOwner(User, 'id', '_id'), 
    uploadUserAvatar.single('avatar'), 
    addAvatarUser
);

userRouter.delete("/:id/avatar",
    deleteAvatarUser
);

export default userRouter;