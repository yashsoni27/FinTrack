import express from "express";
import {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  deleteAccount,
  updateOnboarding
} from "../controllers/auth.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    data: "Hello from auth",
  });
});

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/delete-account", deleteAccount);
router.post("/update-onboarding", updateOnboarding);

export default router;
