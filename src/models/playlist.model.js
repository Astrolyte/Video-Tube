import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema({
    video:{
        type: Schema.Types.ObjectId,
        ref:"Video"
    },
    name:{
        type: String,
        ref:true
    },
    description:{
        type: String,
        ref:True
    },
    videos: [{
            type: Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    owner: {
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true})

export const Playlist = mongoose.model("Playlist",playlistSchema)
