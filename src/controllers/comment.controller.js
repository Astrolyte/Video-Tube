import { isValidObjectId, Mongoose } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getVideoComments = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const {page = 1,limit = 10} = req.query;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    
    const comments = await Comment.aggregate([
        {
            $match:{
                video: videoId,
            },
        },{
            $lookup:{
                from:"videos",
                localField: "video",
                foreignField: "_id",
                as: "CommentOnWhichVideo"
            }
        },{
            $lookup:{
                from:"users",
                localField: "owner",
                foreignField: "_id",
                as: "CommentOwner"
            }
        },{
            $project:{
                content:1,
                owner:{
                    $arrayElemAt: ["$CommentOwner",0],
                },
                video:{
                    $arrayElemAt: ["$CommentOnWhichVideo",0]
                },
                createdAt: 1,
            }
        },{
            $skip: (page-1)*parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        }
    ])
    console.log(comments);

    if(!comments?.length){
        throw new ApiError(404,"Comments are not found");
    }
    return res
            .status(200)
            .json(new ApiResponse(200,comments,"Comments are successfully fetched"));
})

const addComment = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const userid = req.user._id;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Inavlid video id");
    }
    if(!userid){
        throw new ApiError(400,"User needs to logged in");
    }
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Comment cant be empty");
    }

    const addedComment = await Comment.create({
        content,
        video: videoId,
        owner: userid,
    })
    if(!addedComment){
        throw new ApiError(500,"Failed to add comment");
    }
    return res
    .status(200)
    .json(
      new ApiResponse(200, addedComment, videoId, "Comment added successfully")
    );
})

const updatecomment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    const userid = req.user._id;
    if(!isValidObjectId(videoId) || !userid){
        throw new ApiError(400,"Invalid comment id or user");
    }
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Comment cant be empty");
    }
    const updatedcomment = await Comment.findOneAndUpdate({
        _id:commentId,
        owner:userid
        },{
            $set:{
                content,
            },
        },{
            new:true, //this returns the new updated comment instead of the old one
        }
    );
    if(!updatedcomment){
        throw new ApiError(504,"Comment change has an error");
    }
     return res
    .status(200)
    .json(new ApiResponse(200,updatedcomment, "Comment successfully updated"));

})

const deleteComment = asyncHandler(async(req,res)=>{
     const {commentId} = req.params;
    const userid = req.user._id;
    if(!isValidObjectId(videoId) || !userid){
        throw new ApiError(400,"Invalid comment id or user");
    }
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Comment cant be empty");
    }
    const updatedcomment = await Comment.findOneAndDelete({
        _id:commentId,
        owner:userid
    });
    if(!updatedcomment){
        throw new ApiError(504,"Comment change has an error");
    }
     return res
    .status(200)
    .json(new ApiResponse(200, "Comment successfully deleted"));

})

export {getVideoComments,addComment,updatecomment,deleteComment}