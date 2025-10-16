import express from "express";
import { createItemVariant, deleteItemVariant, getAllItemVariants, getItemVariant, updateItemVariant } from "../controllers/itemVariant.controller.js";

const itemVariantRouter = express.Router();

itemVariantRouter.get("/",  getAllItemVariants);

itemVariantRouter.post("/", createItemVariant);

itemVariantRouter.get("/:id", getItemVariant);

itemVariantRouter.put("/:id", updateItemVariant);

itemVariantRouter.delete("/:id", deleteItemVariant);

export default itemVariantRouter;