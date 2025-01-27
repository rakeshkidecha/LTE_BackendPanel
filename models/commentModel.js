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
    status:{
        type:Boolean,
        default:true
    }
},{timestamps:true})


const Comment = mongoose.model('Comment',CommentSchema);
module.exports = Comment;