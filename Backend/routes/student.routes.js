console.log("Student routes file initiated");
import {Router} from "express";
import  {registerStudent}  from "../controllers/user.controller.js";
// import {upload} from "../middlewares/multer.middleware.js"
// import { verifyJWT } from "../middlewares/auth.middleware.js";
console.log("Student routes file started");
const router = Router()
console.log("Student routes loaded");
router.route("/register").post(
    registerStudent
);

// router.route("/login").post(loginUser)

// //secured routes
// router.route("/logout").post(verifyJWT, logoutUser)

// router.route("/refresh-token").post(refreshAccessToken)

export default router;