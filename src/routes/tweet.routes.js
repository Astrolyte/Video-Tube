import {Router} from "express"
import {
    getUserTweet,
    createTweet,
    deleteTweet,
    updateTweet
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/").post(createTweet)
router.route("/:tweetId").delete(deleteTweet)
router.route("/:tweetId").patch(updateTweet)
router.route("/user/:userId").get(getUserTweet);

export default router