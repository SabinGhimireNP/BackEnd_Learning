import { Router } from "express";
import { loginUser, logOutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxcount: 1,
        },
        
        {
            name: "coverImage",
            maxcount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// Secure Routes
router.route("/logout").post( verifyJWT, logOutUser)

router.route("/refreshToken").post( refreshAccessToken)

export default router