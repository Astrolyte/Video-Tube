import { isValidObjectId, Mongoose } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;

    if(!isValidObjectId(channelId)){
        return new ApiError(400,"Valid Channel ID is required");
    }
    const subscriberid = req.user._id;

    if(subscriberid.toString() === chanmelId.toString()){
        throw new ApiError(400,"You cannot subscribe to your own channel");
    }
    const subscription = await Subscription.findOne({
        subscriber:subscriberid,
        channel:channelId
    });

    if(subscription){
        await Subscription.findByIdAndDelete(subscriberid);
        return res.status(200).json(new ApiResponse(200,"Unsubscribed successfully"));
    }
    const newsubscriber = await Subscription.create(
        {
            subscriber:subscriberid,
            channel:channelId
        }
    )
    return res.status(200).json(200,newsubscriber,new ApiResponse(200,"Subscription added successfully"))
})
const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;

    if(!isValidObjectId(channelId)){
        return new ApiError(400,"Valid Channel ID is required");
    }

    const subscribersdocs = await Subscription.findById(channelId).populate("subscriber","_id name email");

    if(!subscribersdocs){
        return new ApiError(404,"No subscribers found");
    }
    return res.status(200).json(new ApiResponse(200,subscribersdocs,"subscribers fetched successfully"));
})

const getsubscribedChannels = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    const userid = req.user._id;
    if(!isValidObjectId(channelId)){
        return new ApiError(400,"Valid channel is required");
    }
    const subscribeddocs = await Subscription.findById(userid).populate("channel","_id name email");
    if(!subscribeddocs){
        return new ApiError(404,"No subscribed channels found");
    }
    return res.status(200).json(new ApiResponse(200,subscribeddocs,"subscribed channels"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getsubscribedChannels
}