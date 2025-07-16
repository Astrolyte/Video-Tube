import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getsubscribedChannels
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/channel/:channelId")
        .get(getsubscribedChannels)
        .post(toggleSubscription)

router.route("/user/:channelId").get(getUserChannelSubscribers);

export default router;