import express from "express";
import { register, login, logout, getCurrentUser } from "../controllers/auth.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", isAuthenticated, getCurrentUser);

export default router;

