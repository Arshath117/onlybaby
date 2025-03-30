import express from "express";
import { forgotPassword, login, logOut, resetPassword, signUp, verifyEmail, updateUserItems, verifyUnverified, isVerified } from "../controllers/user.controller.js";


const router = express.Router();


router.post("/signup",signUp);
router.post("/login",login);
router.post("/logout",logOut);
router.post("/verifyEmail",verifyEmail);
router.post("/verify", verifyUnverified);
router.post("/isVerify", isVerified);

router.put("/updateUserItems",updateUserItems);

router.post("/forgotPassword",forgotPassword);
router.post("/resetPassword/:token",resetPassword);

export default router;