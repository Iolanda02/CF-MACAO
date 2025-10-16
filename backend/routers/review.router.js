import express from "express";
import { createReview, deleteReview, getAllReviews, getReview, updateReview } from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.get("/",  getAllReviews);

reviewRouter.post("/", createReview);

reviewRouter.get("/:id", getReview);

reviewRouter.put("/:id", updateReview);

reviewRouter.delete("/:id", deleteReview);

export default reviewRouter;