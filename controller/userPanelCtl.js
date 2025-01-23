const Category = require('../models/CategoryModel');
const allBlog = require('../models/BlogModel');
const Blog = require('../models/BlogModel');
const moment = require('moment');
module.exports.home = async (req,res)=>{
    try {
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

        const allCategory = await Category.find({status:true});

        let catId;
        if(req.query.catId){
            catId=req.query.catId;
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
            sort
        });
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.singleNews = async (req,res)=>{
    try {
        const reqPath =(req.url).substr(0,11);
        const allCategory = await Category.find({status:true});
        const singleNews = await Blog.findById({_id:req.params.id}).populate('categoryId').exec();
        const recentBlog = await Blog.find({status:true}).sort({_id:-1}).limit(5);
        const totalBlog = await Blog.find({status:true}).countDocuments();
        return res.render('userPanel/singleNews',{allCategory,singleNews,reqPath,recentBlog,totalBlog})
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}