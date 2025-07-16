import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { userId } = req.user._id;

  if (!text) {
    throw new ApiError(400, "No content provided for the Tweet");
  }
  const newTweet = await Tweet.create({
    content,
    owner: userId,
  });
  if (!newTweet) {
    throw new ApiError(400, "There was a problem in creating the new tweet");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, newTweet, "New tweet successfully created"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tweets = await Tweet.find({ owner: id }).sort({ createdAt: -1 }); //descending order sorting

  if (!tweets) {
    throw new ApiError(404, "No tweets found for the user");
  }
  return res
    .status(200)
    .json(200, tweets, "tweets successfully found and fetched");
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetid } = req.params;
  const { content } = req.body;

  const userId = req.user._id;

  if (!isValidObjectId(tweetid)) {
    throw new ApiError(400, "Not valid tweet id ");
  }
  const tweet = await Tweet.findById(tweetid);
  if (tweet.owner.toString() != userId.toString()) {
    throw new ApiError(403, "You cant update this tweet");
  }

  const updatedTweet = await Tweet.findOneAndUpdate(
    tweetid,
    {
      $set: { content },
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "something went wrong while updating the tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req,res)=>{
    const tweetid = req.params;
    const userId = req.user._id;
    if(!isValidObjectId(tweetid)){
        throw new ApiError(400, "Not valid tweet id ");
    }
    const tweet = await Tweet.findById(tweetid);
    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }
    if(tweet.owner.toString()!=userId.toString()){
        throw new ApiError(403, "You cant delete this tweet");
    }
    const deletedtweet = await Tweet.findByIdAndDelete(tweetid);
    if(!deletedtweet){
        throw new ApiError(404, "Something went wrong while deleting the tweet");
    }
    return res
            .status(200)
            .json(new ApiResponse(200,deletedtweet,"Tweet deleted successfully"));
})

export {
    getUserTweet,
    createTweet,
    deleteTweet,
    updateTweet
}