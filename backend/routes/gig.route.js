import express from "express";
import { createGig, getAllGigs, getGigById, getMyGigs } from "../controllers/gig.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, createGig);
router.get("/", getAllGigs);
router.get("/my-gigs", isAuthenticated, getMyGigs);
router.get("/:id", getGigById);

export default router;

