import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { addAddress, applyForSeller, changeCurrentPassword, deleteAddress, forgotPassword, getUserAddress, getUserProfile, loginUser, logoutUser, resetPassword, updateAddress, updateProfile, registerUser } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";



const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/profile")
    .patch(verifyJwt, updateProfile)
    .get(verifyJwt, getUserProfile)
router.route("/address")
    .get(verifyJwt, getUserAddress)
    .post(verifyJwt, addAddress)
    .patch(verifyJwt, updateAddress)
    .delete(verifyJwt, deleteAddress)

router.route("/change-currentPassword").patch(verifyJwt, changeCurrentPassword)
router.route("/change-forgotPassword").post(forgotPassword)
router.route("/resetPassword").post(resetPassword)
router.route("/applyForSeller").post(verifyJwt, applyForSeller)


export default router




