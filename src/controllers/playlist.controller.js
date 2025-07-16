import { isValidObjectId, Mongoose } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, "Please provide name and description");
  }
  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user._id,
  });
  if(!playlist){
    throw new ApiError(400, "Playlist not created successfully");
  }
  return res
        .status(200)
        .json(new ApiResponse(200,playlist,"Playlist created successfully"))
});

const getUserPlaylists = asyncHandler(async(req,res)=>{
    const {userid} = req.params;
    if(!isValidObjectId(userid)){
        throw new ApiError(400, "User not found");
    }
    const playlists = await Playlist.find({ owner: userid });
    if(!playlists || playlists.length === 0){
        throw new ApiError(404,"No playlists found for the user");
    }
    return res.status(200)
            .json(new ApiResponse(200,playlists,"Playlists returned successfully"));
})
const getPlaylistbyid = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist not found");
    }
    const playlist = await Playlist.findById(playlistId).populate("videos");
    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }
    return res.status(200)
                .json(new ApiResponse(200,playlist,"Playlist found successfully"));
})

const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId, videoId} = req.params;
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Playlist or video id not found");
    }
    const updatedplaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },{
            new : true
        }
    );

    return res.status(200).json(new ApiResponse(200,updatedplaylist,"playlist updated perfectly"));    
})
const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId, videoId} = req.params;
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Playlist or video id not found");
        }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos: videoId
            }
        },{
            new:true
        }
    );
    if(!updatedPlaylist){
        throw new ApiError(404,"Playlist not found");
    }    
    return res.status(200).json(new ApiResponse(200,"Video removed from playlist"));
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist or video id not found");
    }
    const updatedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!updatedPlaylist){
        throw new ApiError(404,"Playlist not deleted successfully");
    }
    return res.status(200).json(new ApiResponse(200,"Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    const {name,description} = req.body;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(404,"Playlist not found");
    }
    if (!name || !description) {
        throw new ApiError(400, "Name or description cannot be empty");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name:name,
                description:description
            }
        },{
            new:true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(404,"Error occured while updating playlist");
    }
    return res.status(200).json(new ApiResponse(200,"Playlist updated successfully"));
})

export {
    updatePlaylist,
    deletePlaylist,
    getPlaylistbyid,
    getUserPlaylists,
    addVideoToPlaylist,
    createPlaylist,
    removeVideoFromPlaylist
}