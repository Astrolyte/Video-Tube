import mongoose from "mongoose";
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async(req,res)=>{
    const {text} = req.body;
    const {userId} = req.user._id;

    if(!text){
        throw new ApiError(400,"No content provided for the Tweet");
    }
    const newTweet = await Tweet.create(
        {
            content,
            owner: userId
        }
    );
    if(!newTweet){
        throw new ApiError(400,"There was a problem in creating the new tweet");
    }
    return res.stat

})

const getUserTweet = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    const tweets = await Tweet.find({owner:id}).sort({createdAt:-1});//descending order sorting

    if(!tweets){
        throw new ApiError(404,"No tweets found for the user");
    }
    return res.status(200).json(200,tweets,"tweets successfully found and fetched");
})

const updateTweet = asyncHandler(async(req,res)=>{
    const {tweetid} = req.params;
    const {content} = req.body;

    const userId = req.user._id;
})
