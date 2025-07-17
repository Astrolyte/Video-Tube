import { isValidObjectId, Mongoose } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const userid = req.user._id;
    if(!videoId){
        throw new ApiError(400,"Video id is required");
    }
    if(!userid){
        throw new ApiError(400,"User login is required");
    }
    const existinglike = await Like.findOne({
        videoId: videoId,
        userId: userid
    })
    if(existinglike){
        await Like.findByIdAndDelete(existinglike._id);
        return res.status(200).json(new ApiResponse(200,"Like removed successfully"));
    }
    const likevideo = await Like.create({
        videoId: videoId,
        likedBy: userid
    })
    return res.status(201).json(new ApiResponse(201,likevideo,"Like added successfully"));
});

const togglecommentLike = asyncHandler(async(req,res)=>{
     const {commentId} = req.params;
    const userid = req.user._id;
    if(!commentId){
        throw new ApiError(400,"Video id is required");
    }
    if(!userid){
        throw new ApiError(400,"User login is required");
    }
    const existinglike = await Like.findOne({
        comment: commentId,
        userId: userid
    })
    if(existinglike){
        await Like.findByIdAndDelete(existinglike._id);
        return res.status(200).json(new ApiResponse(200,"Like removed successfully"));
    }
    const likecomment = await Like.create({
        commentId: commentId,
        likedBy: userid
    })
    return res.status(201).json(new ApiResponse(201,likecomment,"Like added successfully"));
})
const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const userid = req.user._id;
    if(!tweetId){
        throw new ApiError(400,"Video id is required");
    }
    if(!userid){
        throw new ApiError(400,"User login is required");
    }
    const existinglike = await Like.findOne({
        tweet: tweetId,
        userId: userid
    })
    if(existinglike){
        await Like.findByIdAndDelete(existinglike._id);
        return res.status(200).json(new ApiResponse(200,"Like removed successfully"));
    }
    const likeTweet = await Like.create({
        tweet: tweetId,
        likedBy: userid
    })
    return res.status(201).json(new ApiResponse(201,likeTweet,"Like added successfully"));
})
const getLikedVideos = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    if(!userId){
        throw new ApiError(400,"User login is required");
    }
    const likedvideos = await Like.find({
        likedBy:userId,
        video: {$exists:true},
    }).populate("video","_id title duration description views");

     return res
    .status(200)
    .json(new ApiResponse(200, likedvideos, "Liked videos fetched successfully"));
})

export {
    toggleVideoLike,
    togglecommentLike,
    toggleTweetLike,
    getLikedVideos
}