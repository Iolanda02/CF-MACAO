import express from "express";
import { createReview, deleteReview, getAllReviews, getReview, updateReview } from "../controllers/review.controller.js";
import { authorizeOwner, authorizeOwnerOrAdmin, protect } from "../middlewares/authentication.js";
import Review from "../models/Review.js";

const reviewRouter = express.Router();

reviewRouter.get("/",  getAllReviews);

reviewRouter.post("/", protect, createReview);

reviewRouter.get("/:id", getReview);

reviewRouter.put("/:id", protect, authorizeOwner(Review, 'id', 'user'), updateReview);

reviewRouter.delete("/:id", protect, authorizeOwnerOrAdmin(Review, 'id', 'user'), deleteReview);

export default reviewRouter;