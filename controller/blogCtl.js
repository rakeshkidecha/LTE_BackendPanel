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
        let date,sort ;
        let perPageActiveBlog = 4,perPageDeactiveBlog = 4;
        let activeBlogpage = 0,deactiveBlogPage=0;

        if(req.query.searchValue){
            searchValue = req.query.searchValue;
        }

        if(req.query.date){
            date = new Date(req.query.date);
        }

        if(req.query.activeBlogpage){
            activeBlogpage = req.query.activeBlogpage;
        }

        if(req.query.deactiveBlogPage){
            deactiveBlogPage = req.query.deactiveBlogPage;
        }

        if(req.query.sort){
            sort = parseInt(req.query.sort);
        }
        // category pass for update the blog 
        const allCategory = await Category.find({status:true});

        // finde all active blog 
        const activeBlog = await Blog.find({
            status : true,
            ...(date && {createdAt:{$gte:new Date(date).setHours(0,0,0,0),$lte:new Date(date).setHours(23, 59, 59, 999)}}),
            $or:[
                {title:{$regex:searchValue,$options:'i'}},
                {description : {$regex:searchValue,$options:'i'}},
            ]
        }).sort({...(sort&&{title:sort})}).skip(perPageActiveBlog*activeBlogpage).limit(perPageActiveBlog).populate('categoryId').exec();

        // find all active blog document counts 
        const totalActiveBlogs = await Blog.find({
            status : true,
            ...(date && {createdAt:{$gte:new Date(date).setHours(0,0,0,0),$lte:new Date(date).setHours(23, 59, 59, 999)}}),
            $or:[
                {title:{$regex:searchValue,$options:'i'}},
                {description : {$regex:searchValue,$options:'i'}},
            ]
        }).countDocuments();

        // finde all deactive blog 
        const deactiveBlog = await Blog.find({
            status : false,
            ...(date && {createdAt:{$gte:new Date(date).setHours(0,0,0,0),$lte:new Date(date).setHours(23, 59, 59, 999)}}),
            $or:[
                {title:{$regex:searchValue,$options:'i'}},
                {description : {$regex:searchValue,$options:'i'}},
            ]
        }).sort({...(sort&&{title:sort})}).skip(perPageDeactiveBlog*deactiveBlogPage).limit(perPageDeactiveBlog).populate('categoryId').exec();

        // find all deactive blog document counts 
        const totalDeactiveBlogs = await Blog.find({
            status : false,
            ...(date && {createdAt:{$gte:new Date(date).setHours(0,0,0,0),$lte:new Date(date).setHours(23, 59, 59, 999)}}),
            $or:[
                {title:{$regex:searchValue,$options:'i'}},
                {description : {$regex:searchValue,$options:'i'}},
            ]
        }).countDocuments();

        const totalActivePage = Math.ceil(totalActiveBlogs / perPageActiveBlog);
        const totalDeactivePage = Math.ceil(totalDeactiveBlogs / perPageDeactiveBlog);

        return res.render('blog/viewBlog',{
            activeBlog,
            allCategory,
            activeBlogpage:parseInt(activeBlogpage),
            totalActivePage,
            deactiveBlog,
            deactiveBlogPage:parseInt(deactiveBlogPage),
            totalDeactivePage,
            searchValue,
            date
        });
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

module.exports.changeBlogStatus = async (req,res)=>{
    try {
        const {id,statusType} = req.params;
        const changedBlogStatus = await Blog.findByIdAndUpdate(id,{status:statusType});
        if(changedBlogStatus){
            console.log("Blog statuse changed..");
            return res.redirect('back');
        }else{
            console.log("Faild to chang blog status");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deactiveAllBlog = async (req,res)=>{
    try {
        const deactivateBlogs= await Blog.updateMany({_id:{$in:req.body.ids}},{status:false});
        if(deactivateBlogs){
            console.log("Deactive all blog");
            return res.redirect('back');
        }else{
            console.log("Faild to deactive blogs");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.oprateAllDeactiveBlog = async (req,res)=>{
    try {
        console.log(req.body);
        if(req.body.activeAll){
            const activateBlogs = await Blog.updateMany({_id:{$in:req.body.ids}},{status:true});
            if(activateBlogs){
                console.log("Activate all blogs");
                return res.redirect('back');
            }else{
                console.log("faild to active blogs");
                return res.redirect('back')
            }
        }else{
            const deletedBlog = await Blog.deleteMany({_id:{$in:req.body.ids}});
            if(deletedBlog){
                console.log("Deleted blogs...");
                return res.redirect('back')
            }else{
                console.log("Faild to delete blogs");
                return res.redirect('back');
            }
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}