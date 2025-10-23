import express from "express";
import { addProductImages, createItem, deleteItem, deleteProductImage, getAllItems, getItem, getItemVariantsByItemId, getReviewsByItemId, updateItem, updateVariantImage } from "../controllers/item.controller.js";
import { protect, restrictTo } from "../middlewares/authentication.js";
import { uploadProductImage } from "../middlewares/uploadCloudinary.js";

const itemRouter = express.Router();

itemRouter.get("/",  getAllItems);

itemRouter.get("/:id", getItem);

itemRouter.get('/:itemId/variants', getItemVariantsByItemId);

itemRouter.get('/:itemId/reviews', getReviewsByItemId);

itemRouter.use(protect);

itemRouter.post("/", restrictTo('admin'), createItem);

itemRouter.put("/:id", restrictTo('admin'), updateItem);

itemRouter.delete("/:id", restrictTo('admin'), deleteItem);

itemRouter.patch("/:productId/variants/:variantId/images", 
    restrictTo('admin'), 
    uploadProductImage.single('image'),
    addProductImages
);
    // uploadProductImage.array('images', 5), 
    
itemRouter.patch("/:productId/variants/:variantId/images/:imageId",
    restrictTo('admin'),
    updateVariantImage
);

itemRouter.delete("/:productId/variants/:variantId/images/:imageId", restrictTo('admin'), deleteProductImage);

export default itemRouter;