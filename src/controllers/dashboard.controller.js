import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.model.js";
import {Comment} from "../models/comment.model.js"


const getChannelStats = asyncHandler(async (req, res) => {
  const userid = req.user._id;
  const totalvideos = await Video.countDocuments({ owner: userid });

  if (totalvideos === null || totalvideos === undefined) {
    throw new ApiError(
      500,
      "Something went wrong while displaying total videos"
    );
  }
  const totalSubscribers = await Subscription.countDocuments({channel:userid});
   if (totalSubscribers === null || totalSubscribers === undefined) {
    throw new ApiError(
      500,
      "Something went wrong while displaying total subscribers"
    );
  }
  const totalvideolikes = await Like.countDocuments({
    video:{
        $in: await Video.find({owner:userid}).distinct("_id")
    }
  })
  if (totalvideolikes === null || totalvideolikes === undefined) {
    throw new ApiError(
      500,
      "Something went wrong while displaying total likes"
    );
  }
  const totalTweetLikes = await Like.countDocuments({
    tweet:{
        $in: await Tweet.find({owner:userid}).distinct("_id"),
    }
  });
  if (totalTweetLikes === null || totalTweetLikes === undefined) {
    throw new ApiError(
      500,
      "Something went wrong while displaying total tweet likes"
    );
  }
  const totalCommentLikes = await Like.countDocuments({
    comment:{
        $in: await Comment.find({owner:userid}).distinct("_id"),
    }
  })
  if (totalCommentLikes === null || totalCommentLikes === undefined) {
    throw new ApiError(
      500,
      "Something went wrong while displaying total comment likes"
    );
  }
  const totalViews = await Video.aggregate([
    {$match:{
        owner:userid,
    }},
    {
        $group:{
            _id:null,
            totalViews: {$sum : "$views"},
        }
    }
  ])
  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalvideos,
        totalSubscribers,
        totalvideolikes,
        totalTweetLikes,
        totalCommentLikes,
        totalViews: totalViews[0]?.totalViews || 0, // Default to 0 if no views are found
      },
      "Channel stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async(req,res)=>{
    const userId = req.user._id;

    const videos = await Video.find({
        owner:userId,
    }).sort({createdAt:-1});

    if (!videos || videos.length === 0) {
    throw new ApiError(404, "No videos found for this channel");
    }
    res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export {
    getChannelStats,
    getChannelVideos
}
