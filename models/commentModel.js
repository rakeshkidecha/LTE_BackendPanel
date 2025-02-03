const mongoose = require('mongoose');
const moment = require('moment');

const CommentSchema=  mongoose.Schema({
    blogId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Blog',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    comment:{
        type:String,
        required:true
    },
    likes : [{
       type:mongoose.Schema.Types.ObjectId,
       ref:'User' 
    }],
    dislikes : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User' 
     }],
    status:{
        type:Boolean,
        default:true
    }
},{timestamps:true})


const Comment = mongoose.model('Comment',CommentSchema);
module.exports = Comment;