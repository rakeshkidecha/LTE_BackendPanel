const Blog =  require('../models/BlogModel');
const Category = require('../models/CategoryModel');
const Comment = require('../models/commentModel');
const path = require('path');
const fs = require('fs');
const {validationResult} = require('express-validator');

module.exports.addBlog = async (req,res)=>{
    try {
        const allCategory = await Category.find({status:true});
        return res.render('blog/addBlog',{
            allCategory,
            errors : null,
            oldValue : null
        });
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.insertBlog = async (req,res)=>{
    try {
        const result = validationResult(req);
        if(!result.isEmpty()){
            console.log(result);
            const allCategory = await Category.find({status:true});
            return res.render('blog/addBlog',{
                allCategory,
                errors : result.mapped(),
                oldValue : req.body
            })
        }

        let imagePath = '';
        if(req.file){
            imagePath = Blog.imgPath+'/'+req.file.filename;
        }
        req.body.blog_image = imagePath;

        const addedBlog = await Blog.create(req.body);
        if(addedBlog){
            const findCategory = await Category.findById(addedBlog.categoryId);
            findCategory.blogIds.push(addedBlog._id);
            await Category.findByIdAndUpdate(addedBlog.categoryId,findCategory);
            console.log("Blog Add Successfully");
            res.locals.flash = req.flash('success',"Blog Add Successfully");
            return res.redirect('/blog');
        }else{
            res.locals.flash = req.flash('error',"Faild to add blog");
            console.log("Faild to add Blog");
            return res.redirect('/blog');
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('/blog');
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
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deleteBlog = async(req,res)=>{
    try {

        const singleBlog = await Blog.findById(req.params.id);
        try {
            const deleteImagePath = path.join(__dirname,'..',singleBlog.blog_image);
            await fs.unlinkSync(deleteImagePath);
        } catch (err) {
            console.log("Image not Found",err);
            res.locals.flash = req.flash('error',"Image not Found");
        }

        const singleCategory = await Category.findById(singleBlog.categoryId);
        const index = singleCategory.blogIds.indexOf(singleBlog._id);
        singleCategory.blogIds.splice(index,1);
        await Category.findByIdAndUpdate(singleCategory._id,singleCategory);
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if(deletedBlog){
            await Comment.deleteMany({_id:{$in:singleBlog.commentIds}});
            console.log("Blog Deleted Successfully..");
            res.locals.flash = req.flash('success',"Blog Deleted Successfully..");
            return res.redirect('back');
        }else{
            res.locals.flash = req.flash('error',"Faild to delete Blog");
            console.log("Faild to delete Blog");
            return res.redirect('back');
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.updateBlog = async(req,res)=>{
    try {
        const singleBlog = await Blog.findById(req.params.id);
        const allCategory = await Category.find({status:true});
        return res.render('blog/updateBlog',{singleBlog,allCategory});
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log("Something Wrong",err)
    }
}

module.exports.editBlog = async(req,res)=>{
    try {
        const singleBlog = await Blog.findById(req.body.id);
        if(req.file){
            try {
                const deleteImagePath = path.join(__dirname,'..',singleBlog.blog_image);
                await fs.unlinkSync(deleteImagePath);
            } catch (err) {
                res.locals.flash = req.flash('error',"Image not Found");
                console.log("Image not Found",err);
            }

            let newImagePath = Blog.imgPath+'/'+req.file.filename;
            req.body.blog_image = newImagePath;
        }else{
            req.body.blog_image = singleBlog.blog_image;
        }
        

        const updatedBlog = await Blog.findByIdAndUpdate(req.body.id,req.body);
        if(updatedBlog){
            if(singleBlog.categoryId != req.body.categoryId){
                const singleCategory = await Category.findById(singleBlog.categoryId);
                const index = singleCategory.blogIds.indexOf(singleBlog._id);
                singleCategory.blogIds.splice(index,1);
                await Category.findByIdAndUpdate(singleCategory._id,singleCategory);

                const newCategory = await Category.findById(req.body.categoryId);
                newCategory.blogIds.push(updatedBlog._id);
                await Category.findByIdAndUpdate(req.body.categoryId,newCategory);
            }
            console.log("Blog Update successfully");
            res.locals.flash = req.flash('success',"Blog Updated Successfully");
            return res.redirect('/blog/viewBlog');
        }else{
            res.locals.flash = req.flash('success',"Faild to Update blog");
            console.log("Faild to update Blog");
            return res.redirect('back');
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.changeBlogStatus = async (req,res)=>{
    try {
        const {id,statusType} = req.params;
        const singleBlog = await Blog.findById(id).populate('categoryId').exec();
        if(singleBlog.categoryId.status){
            const changedBlogStatus = await Blog.findByIdAndUpdate(id,{status:statusType});
            if(changedBlogStatus){
                if(statusType == 'false'){
                    await Comment.updateMany({_id:{$in:changedBlogStatus.commentIds}},{status:statusType});
                }
                console.log("Blog status changed..");
                res.locals.flash = req.flash('success',"Blog statuse changed..");
                return res.redirect('back');
            }else{
                res.locals.flash = req.flash('error',"Faild to chang blog status");
                console.log("Faild to chang blog status");
                return res.redirect('back');
            }
        }else{
            res.locals.flash = req.flash('error',"This Blog Category is not active");
            console.log("This Blog Category is not active");
            return res.redirect('back');
        }
        
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deactiveAllBlog = async (req,res)=>{
    try {
        const allDeactiveBlog = await Blog.find({_id:{$in:req.body.ids}})
        const deactivateBlogs= await Blog.updateMany({_id:{$in:req.body.ids}},{status:false});
        if(deactivateBlogs){
            allDeactiveBlog.map(async(item)=>{
                await Comment.updateMany({_id:{$in:item.commentIds}},{status:false});
            })
            console.log("Deactive all blog");
            res.locals.flash = req.flash('success',"Deactive all selected blog");
            return res.redirect('back');
        }else{
            res.locals.flash = req.flash('error',"Faild to deactive selected blogs");
            console.log("Faild to deactive blogs");
            return res.redirect('back');
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.oprateAllDeactiveBlog = async (req,res)=>{
    try {
        if(req.body.activeAll){

            const alldeActiveBlog = await Blog.find({_id:{$in:req.body.ids}}).populate('categoryId').exec();
            const deactivateBlogsIds = alldeActiveBlog.map((item)=>{
                if(item.categoryId.status){
                    return item._id;
                }
            });

            const activateBlogs = await Blog.updateMany({_id:{$in:deactivateBlogsIds}},{status:true});
            if(activateBlogs){
                console.log("Activate all blogs there category are active");
                res.locals.flash = req.flash('warning',"Activate all selected blogs Expects ther category are dactive");
                return res.redirect('back');
            }else{
                res.locals.flash = req.flash('error',"faild to active all selected blogs");
                console.log("faild to active blogs");
                return res.redirect('back')
            }
        }else{

            const deactiveAllBlog = await Blog.find({_id:{$in:req.body.ids}});

            deactiveAllBlog.map(async(item)=>{
                try {
                    const deleteImagePath = path.join(__dirname,'..',item.blog_image);
                    await fs.unlinkSync(deleteImagePath);
                } catch (err) {
                    res.locals.flash = req.flash('error',"image not found");
                    console.log("image not found");
                }
                const singleCategory = await Category.findById(item.categoryId);
                const index = singleCategory.blogIds.indexOf(item._id);
                singleCategory.blogIds.splice(index,1);
                await Category.findByIdAndUpdate(singleCategory._id,singleCategory);
                await Comment.deleteMany({_id:{$in:item.commentIds}});
            });
 
            const deletedBlog = await Blog.deleteMany({_id:{$in:req.body.ids}});
            if(deletedBlog){
                console.log("Deleted blogs...");
                res.locals.flash = req.flash('success',"Delete all selected Blog");
                return res.redirect('back')
            }else{
                console.log("Faild to delete blogs");
                res.locals.flash = req.flash('error',"faild to all selected Blog");
                return res.redirect('back');
            }
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}


module.exports.viewComment = async (req,res)=>{
    try {
        const allComments = await Comment.find();
        return res.render('blog/viewComment',{allComments});

    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.changeCommentStatus = async (req,res)=>{
    try {
        if(req.query.status=="true"){
            const singleComment = await Comment.findById(req.query.id).populate('blogId').exec();
            if(!singleComment.blogId.status){
                req.flash('error',"The Blog of this comment is Deactive, so you can't Active this comment");
                return res.redirect('back');
            }
        }
        const changeStatus = await Comment.findByIdAndUpdate(req.query.id,{status:req.query.status});
        if(changeStatus){
            console.log("Status change Successfully");
            res.locals.flash = req.flash('success',"Status Change Successfully..");
            return res.redirect('back');
        }else{
            console.log("Faild to change status");
            res.locals.flash = req.flash('error',"Faild to change status of the comment")
            return res.redirect('back');
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}