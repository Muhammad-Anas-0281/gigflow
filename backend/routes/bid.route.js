import express from "express";
import { submitBid, getBidsByGigId, getMyBids, hireBid } from "../controllers/bid.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/:gigId", isAuthenticated, submitBid);
router.get("/my-bids", isAuthenticated, getMyBids);
router.get("/:gigId", isAuthenticated, getBidsByGigId);
router.patch("/:bidId/hire", isAuthenticated, hireBid);

export default router;

