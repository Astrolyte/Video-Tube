import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updatecomment,
    deleteComment
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)

router.route("/v/:videoId").get(getVideoComments)
router.route("/v/:videoId").post(addComment)
router.route("/c/:commentId").patch(updatecomment)
router.route("/c/:commentId").delete(deleteComment)

export default router;