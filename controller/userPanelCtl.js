const Category = require('../models/CategoryModel');
const allBlog = require('../models/BlogModel');
const Blog = require('../models/BlogModel');
const moment = require('moment');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const {validationResult} = require('express-validator');

module.exports.home = async (req,res)=>{
    try {

        res.clearCookie('preUrl');

        const reqPath =(req.url).substr(0,11);
        let searchValue = '';
        let page = 0,perPageBlog = 3;
        let sort,sortType = '';

        if(req.query.sort&&req.query.sortType){
            sort = parseInt(req.query.sort);
            sortType = req.query.sortType;
        }

        if(req.query.search){
            searchValue = req.query.search;
        }

        if(req.query.page){
            page = req.query.page;
        }

        const allCategory = await Category.find({status:true}).populate('blogIds').exec();
        allCategory.map((item)=>{
            let count = 0 ;
            item.blogIds.map((v)=>{
                if(v.status){
                    count++;
                }
            })
            item.blogCount = count;
        })
        

        let catId ,currentCategory;
        if(req.query.catId){
            catId=req.query.catId;
            currentCategory = await Category.findById(catId);
        }

        const allBlog = await Blog.find({
            status:true,
            ...(catId&&{categoryId:catId}),
            title:{$regex:searchValue,$options:'i'},
        }).sort({...(sort&&{[sortType]:sort})}).skip(perPageBlog*page).limit(perPageBlog).populate('categoryId').exec();

        const totalBlog = await Blog.find({
            status:true,
            title:{$regex:searchValue,$options:'i'},
        }).countDocuments();

        allBlog.map((item)=>{
            let momentTime = moment(item.createdAt).fromNow();
            item.time  = momentTime;
        })

        const totalPage = Math.ceil(totalBlog/perPageBlog);

        return res.render('userPanel/home',{
            reqPath,
            allCategory,
            allBlog,
            searchValue,
            page : parseInt(page),
            totalPage,
            totalBlog,
            sortType,
            sort,
            currentCategory
        });
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.singleNews = async (req,res)=>{
    try {

        res.cookie('preUrl',`/singleNews/${req.params.id}`)

        const reqPath =(req.url).substr(0,11);

        const allCategory = await Category.find({status:true}).populate('blogIds').exec();
        allCategory.map((item)=>{
            let count = 0 ;
            item.blogIds.map((v)=>{
                if(v.status){
                    count++;
                }
            })
            item.blogCount = count;
        })

        const singleNews = await Blog.findById({_id:req.params.id}).populate('categoryId').exec();
        const recentBlog = await Blog.find({status:true}).sort({_id:-1}).limit(5);
        const totalBlog = await Blog.find({status:true}).countDocuments();
        const allComments = await Comment.find({blogId:req.params.id,status:true}).populate('userId').exec();
        let currentCategory = singleNews.categoryId;
        allComments.map((item)=>{
            item.time = moment(item.createdAt).fromNow();
        })

        return res.render('userPanel/singleNews',{allCategory,singleNews,reqPath,recentBlog,totalBlog,allComments,currentCategory})
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.addComment = async(req,res)=>{
    try {
        if(!res.locals.userData){
            return res.redirect('/userLogin');
        }

        const addedComment = await Comment.create(req.body);
        if(addedComment){
            const singleBlog = await Blog.findById(addedComment.blogId);
            singleBlog.commentIds.push(addedComment._id);
            await Blog.findByIdAndUpdate(singleBlog._id,singleBlog);
            res.locals.flash = req.flash('success',"Comment Add Successfully");
            return res.redirect('back');
        }else{
            console.log("Faild to add comment");
            res.locals.flash = req.flash('error',"Faild to add comment");
            return res.redirect('back');
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deleteComment = async (req,res)=>{
    try {
        
        const singleComment = await Comment.findById(req.params.id);
        const deletedComment = await Comment.findByIdAndDelete(req.params.id);
        if(deletedComment){
            const singleBlog = await Blog.findById(singleComment.blogId);
            singleBlog.commentIds.splice(singleBlog.commentIds.indexOf(singleComment._id),1);
            await Blog.findByIdAndUpdate(singleBlog._id,singleBlog);
            console.log("comment Deleted..");
            res.locals.flash = req.flash('success',"comment Deleted..");
            return res.redirect('back');
        }else{
            console.log("Faild to delete comment");
            res.locals.flash = req.flash('error',"Faild to delete comment");
            return res.redirect('back');
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.likeComment = async(req,res)=>{
    try {

        const {id} = req.params;
        const singleComment = await Comment.findById(id).populate('userId').exec();

        if(!singleComment.likes.includes(req.user._doc._id)){

            if(singleComment.dislikes.includes(req.user._doc._id)){
                singleComment.dislikes.splice(singleComment.dislikes.indexOf(req.user._doc._id),1);
            }     
            singleComment.likes.push(req.user._doc._id);
        }else{
            singleComment.likes.splice(singleComment.likes.indexOf(req.user._doc._id),1);
        }
        await Comment.findByIdAndUpdate(id,singleComment);


        let allComments = await Comment.find({status:true}).populate('userId').exec();

        allComments = allComments.map((item)=>{
            return {...item.toObject(),time: moment(item.createdAt).fromNow()}
        });


        if(allComments){
            return res.json(allComments);
        }else{
            return res.redirect('back')
        }

    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');   
    }
}

module.exports.dislikeComment = async(req,res)=>{
    try {

        const {id} = req.params;
        const singleComment = await Comment.findById(id).populate('userId').exec();

        if(!singleComment.dislikes.includes(req.user._doc._id)){

            if(singleComment.likes.includes(req.user._doc._id)){
                singleComment.likes.splice(singleComment.likes.indexOf(req.user._doc._id),1);
            }

            singleComment.dislikes.push(req.user._doc._id);
        }else{
            singleComment.dislikes.splice(singleComment.dislikes.indexOf(req.user._doc._id),1);
        }
        await Comment.findByIdAndUpdate(id,singleComment);


        let allComments = await Comment.find({status:true}).populate('userId').exec();

        allComments = allComments.map((item)=>{
            return {...item.toObject(),time: moment(item.createdAt).fromNow()}
        });


        if(allComments){
            return res.json(allComments);
        }else{
            return res.redirect('back')
        }

    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');   
    }
}


// user login and  sign up 
module.exports.userSignUp = async(req,res)=>{
    try {
        return res.render('userPanel/userSIgnUp',{
            errors : null,
            oldValue:null
        })
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.createUser = async (req,res)=>{
    try {

        const result = validationResult(req);
        if(!result.isEmpty()){
            console.log(result);
            return res.render('userPanel/userSignUp',{
                errors : result.mapped(),
                oldValue : req.body
            })
        }

        const isExistEmail = await User.find({email:req.body.email}).countDocuments();

        if(isExistEmail!=0){
            console.log("This Email is already exist, try another Email for sign up"); 
            res.locals.flash = req.flash('error',"This Email is already exist, try another Email for sign up");
            
            return res.redirect('back');
        }

        if(req.body.password != req.body.confirmPassword){
            console.log("password and  comfirm password are not same");
            res.locals.flash = req.flash('error',"password and  comfirm password are not same.");
            return res.redirect('back');
        }
        

        let imagePath = '';
        if(req.file){
            imagePath = User.imgPath+'/'+req.file.filename;
        }

        req.body.profile_image = imagePath;
        req.body.name = req.body.fName+' '+req.body.lName;

        const createdUser = await User.create(req.body);
        if(createdUser){
            console.log("User Sign Up successfully");
            res.locals.flash = req.flash('success',"User Sign Up successfully");
            return res.redirect('/');
        }else{
            console.log("Faild to SignUp");
            res.locals.flash = req.flash('error',"Faild to SignUp");
            return res.redirect('/userSignUp');
        }

    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('/userSignUp');
    }
}

module.exports.userLogin = async(req,res)=>{
    try {
        return res.render('userPanel/userLogin');
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.checkUser = async (req,res)=>{
    try {
        req.flash('success',"Login Successfully");
        if(req.cookies.preUrl){
            const preUrl =  req.cookies.preUrl;
            res.clearCookie('preUrl');
            return res.redirect(preUrl);
        }else{
            return res.redirect('/')
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.logOutUser = async(req,res)=>{
    try {
        req.session.destroy(err=>err?false:res.redirect('back'))
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}
// =//0----------------------