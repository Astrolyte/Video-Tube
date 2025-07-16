import { Router } from "express";
import {
    toggleVideoLike,
    togglecommentLike,
    toggleTweetLike,
    getLikedVideos
} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.use(verifyJWT)

router.route("/videos").get(getLikedVideos)
router.route("/toggle/v/:videoId/").post(toggleVideoLike)
router.route("/toggle/c/:commentId/").post(togglecommentLike)
router.route("/toggle/t/:tweetId/").post(toggleTweetLike)

export default router