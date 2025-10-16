import express from "express";
import { createItem, deleteItem, getAllItems, getItem, updateItem } from "../controllers/item.controller.js";
import { getReviewsByItemId } from "../controllers/review.controller.js";
import { getItemVariantsByItemId } from "../controllers/itemVariant.controller.js";

const itemRouter = express.Router();

itemRouter.get("/",  getAllItems);

itemRouter.post("/", createItem);

itemRouter.get("/:id", getItem);

itemRouter.put("/:id", updateItem);

itemRouter.delete("/:id", deleteItem);

itemRouter.route('/:itemId/variants').get(getItemVariantsByItemId);

itemRouter.route('/:itemId/reviews').get(getReviewsByItemId);

export default itemRouter;