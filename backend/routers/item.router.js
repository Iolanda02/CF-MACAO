import express from "express";
import { createItem, deleteItem, getAllItems, getItem, getItemVariantsByItemId, getReviewsByItemId, updateItem } from "../controllers/item.controller.js";

const itemRouter = express.Router();

itemRouter.get("/",  getAllItems);

itemRouter.post("/", createItem);

itemRouter.get("/:id", getItem);

itemRouter.put("/:id", updateItem);

itemRouter.delete("/:id", deleteItem);

itemRouter.get('/:itemId/variants', getItemVariantsByItemId);

itemRouter.get('/:itemId/reviews', getReviewsByItemId);

export default itemRouter;