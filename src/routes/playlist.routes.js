import { Router } from "express";
import {
    updatePlaylist,
    deletePlaylist,
    getPlaylistbyid,
    getUserPlaylists,
    addVideoToPlaylist,
    createPlaylist,
    removeVideoFromPlaylist
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/").post(verifyJWT,createPlaylist);
router.route("/user/:userid").get(verifyJWT,getUserPlaylists)
router.route("/:playlistId")
        .get(verifyJWT,getPlaylistbyid)
        .patch(verifyJWT,updatePlaylist)
        .delete(verifyJWT,deletePlaylist)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

export default router;