const Blog =  require('../models/BlogModel');
const Category = require('../models/CategoryModel');

module.exports.addBlog = async (req,res)=>{
    try {
        const allCategory = await Category.find({status:true});
        return res.render('blog/addBlog',{allCategory});
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.insertBlog = async (req,res)=>{
    try {
        const addedBlog = await Blog.create(req.body);
        if(addedBlog){
            console.log("Blog Add Successfully");
            return res.redirect('back');
        }else{
            console.log("Faild to add Blog");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.viewBlog = async(req,res)=>{
    try {

        let searchValue = '';
        let perPage = 4;
        let page = 0;

        if(req.query.searchValue){
            searchValue = req.query.searchValue;
        }

        if(req.query.page){
            page = req.query.page;
        }

        const allCategory = await Category.find({status:true});
        const allBlog = await Blog.find({
            $or:[
                {title:{$regex:searchValue,$options:'i'}},
                {description : {$regex:searchValue,$options:'i'}},
            ]
        }).skip(perPage*page).limit(perPage).populate('categoryId').exec();

        const totalBlogs = await Blog.find({
            $or:[
                {title:{$regex:searchValue,$options:'i'}},
                {description : {$regex:searchValue,$options:'i'}},
            ]
        }).countDocuments();

        const totalPage = Math.ceil(totalBlogs / perPage);

        console.log(totalPage);

        return res.render('blog/viewBlog',{allBlog,allCategory,searchValue,page:parseInt(page),totalPage});
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deleteBlog = async(req,res)=>{
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if(deletedBlog){
            console.log("Blog Deleted Successfully..");
            return res.redirect('back');
        }else{
            console.log("Faild to delete Blog");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.editBlog = async(req,res)=>{
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(req.body.id,req.body);
        if(updatedBlog){
            console.log("Blog Update successfully");
            return res.redirect('back');
        }else{
            console.log("Faild to update Blog");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}