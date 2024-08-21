import express from "express";
import {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  deleteAccount,
} from "../controllers/auth.js";

const router = express.Router();

router.get("/auth", (req, res) => {
  return res.json({
    data: "Hello from auth",
  });
});

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/delete-account", deleteAccount);

export default router;
