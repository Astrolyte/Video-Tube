import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { getVideoDuration } from "../utils/ffmpeg.js";
const getallvideos = asyncHandler(async(req,res)=>{
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId, 
    } = req.query;
    
    const match = {
    ...(query ? { title: { $regex: query, $options: "i" } } : {}), // If query exists, match titles that contain the search term (case-insensitive)
    ...(userId ? { owner: mongoose.Types.ObjectId(userId) } : {}), // If userId exists, filter videos by that owner
  };

    try{
        const validSortFields = ["createdAt","title"];
        const validSortTypes = ["asc","desc"];
        if(sortBy && !validSortFields.includes(sortBy)){
            throw new ApiError(400,"Invalid sorting field");
        }
        if(sortType && !validSortTypes.includes(sortType)){
            throw new ApiError(400,"Invalid sortType");
        }

        const queryObj = query ? {
            title:{
                $regex: new RegExp(
                    query
                    .replace(/[-\/\\^$*+?.()|[\]{}]/g, " ")
                    .split(" ")
                    .join("|"),
                    "i"//case sensitive
                ),
            },
        }:{};
        const videos = await Video.find(queryObj)
                            .sort({createdAt: -1})
                            .limit(limit*1)
                            .skip((page-1)*limit)
                            .populate("owner","fullname username avatar coverImage");

        return res.status(200).json(new ApiResponse(200,videos,"sucess in loading the page"))
    }catch(error){
        return res.status(400).json(new ApiError(error.message,error.statusCode));
    }
});
const getUserVideos = asyncHandler(async(req,res)=>{
    try{
        const {page = 1,limit = 10} = req.qeury;
        const {userId} = req.params;

        if(!mongoose.isValidObjectId(userId)){
            return res.status(400).json({message:"Inavlid user id"});
        }
        const videos = await Video.aggregate([
            {
                $match:{
                    owner: new mongoose.Types.ObjectId(userId), 
                    
                },
            },
            {
                $sort:{
                    createdAt: -1,
                },
            },
            {
                $skip: (page-1)*limit,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                },
            },
            {
                $addFields:{
                    owner: {
                        $arrayElemAt: ["$owner",0]
                    },
                },
            },{
                $project:{
                    title:1,
                    description:1,
                    videoFile: 1,
                    thumbnail: 1,
                    duration: 1,
                    views: 1,
                    createdAt: 1,
                    owner: {
                        _id: 1,
                        username: 1,
                        fullname: 1,
                        avatar: 1,
                        coverImage: 1,
                    },
                },
            },
        ]);
        if(videos.length === 0){
            return res.status(200).json(new ApiResponse(400,"No Videos found for this User"));
        }
        return res.status(200).json(new apiResponse(200, videos, "success"));
    }catch(error){
        return res.status(400).json(new ApiError(error.message,error.statusCode));
    }
})
const uploadVideo = asyncHandler(async(req,res) => {
  const { title, description } = req.body;
  const videolocalpath = req.files.videoFile[0].path;
  const thumbnaillocalpath = req.files.thumbnail[0].path;

  if (!title) throw new ApiError(400, "Title is required");
  if (!description) throw new ApiError(400, "Description is required");
  if (!videolocalpath) throw new ApiError(400, "Video is required");
  if (!thumbnaillocalpath) throw new ApiError(400, "Thumbnail is required");

  const cloudvideo = await uploadOnCloudinary(videolocalpath);
  const cloudthumbnail = await uploadOnCloudinary(thumbnaillocalpath);

  if (!cloudvideo || !cloudvideo.secure_url) {
    throw new ApiError(400, "Failed to upload video");
  }
  if (!cloudthumbnail || !cloudthumbnail.secure_url) {
    throw new ApiError(400, "Failed to upload thumbnail");
  }

  const newVideo = await Video.create({
    videoFile: cloudvideo.secure_url,
    thumbnail: cloudthumbnail.secure_url,
    title,
    description,
    duration: cloudvideo.duration,
    owner: req.user._id,
  });

  if (!newVideo) {
    throw new ApiError(400, "Error in publishing video on db");
  }

  return res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});


const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    const video = await Video.findById(videoId).populate("owner","name email");
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    return res.status(201).json(new ApiResponse(201,video,"Video found successfully"))
    /* Video Retrieval Notes:

👉 What does `.populate("owner", "name email")` do?
   - By default, the `owner` field in the video document only contains the owner's `_id`.
   - `populate()` replaces this ID with an actual object containing the owner's `name` and `email`.
   - This reduces extra API calls from the frontend to fetch user details separately.
*/
})

const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const {title,description} = req.body;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    let updatedata = {title,description};
    if(req.file){
        const thumbnailLocalpath = req.file.path;

        if(!thumbnailLocalpath){
            throw new ApiError(400,"Thumbnail file is missing")
        }

        const thumbnail = await uploadOnCloudinary(thumbnailLocalpath)
        if(!thumbnail.url){
            throw new ApiError(400,"Failed to upload thumbnail")
        }
        updatedata.thumbnail = thumbnail.url;
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {$set: updatedata},
        {new: true,runValidators:true}
    );
    if(!updatedVideo){
        throw new ApiError(404,"Video not found");
    }
    return res.status(200).json(new ApiResponse(200,updatedVideo,"Video details updated perfectly"))
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    const video = await Video.findByIdAndDelete(videoId);

    if(!video){
        throw new ApiError(404,"Video not found");
    }
    return res
            .status(200)
            .json(new ApiResponse(200,video,"Video deleted successfully"))
})
const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    const video = await Video.findById(videoId);
      if (!video) {
    throw new ApiError(404, "Video not found");
  }
   video.isPublished = !video.isPublished;
   await video.save();
    return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video publish status toggled successfully")
    );
})

export {
    getVideoById,
    updateVideo,
    uploadVideo,
    deleteVideo,
    togglePublishStatus,
    getUserVideos,
    getallvideos
}