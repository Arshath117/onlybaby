import express from "express";
import { getReviewsByProduct, addReview, updateReview, deleteReview, getReviewsByID } from "../controllers/review.controller.js";
const router = express.Router();

router.get("/reviews/:productName", getReviewsByProduct);
router.post("/addreview", addReview);
router.put("/reviews/update", updateReview);
router.delete("/reviews/:productName/:email", deleteReview);
router.get("/fetch/:email", getReviewsByID);

export default router;