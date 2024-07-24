import express from "express";

const router = express.Router();

import { signUp, signIn, forgotPassword, resetPassword } from "../controllers/auth.js";

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;