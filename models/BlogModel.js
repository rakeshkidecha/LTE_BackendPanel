const mongoose = require('mongoose');

const BlogSchema = mongoose.Schema({
    categoryId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category",
    },
    title:{
        type : String,
        required : true
    },
    description:{
        type : String,
        required : true
    },
    status:{
        type:Boolean,
        default:true
    },
},{timestamps:true})


const Blog = mongoose.model('Blog',BlogSchema);

module.exports = Blog;