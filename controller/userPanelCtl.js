const Category = require('../models/CategoryModel');
const allBlog = require('../models/BlogModel');
const Blog = require('../models/BlogModel');

module.exports.home = async (req,res)=>{
    try {
        const allBlog = await Blog.find({status:true});
        const allCategory = await Category.find({status:true});
        return res.render('userPanel/home',{allCategory,allBlog});
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.singleNews = async (req,res)=>{
    try {
        const allCategory = await Category.find({status:true});
        const singleNews = await Blog.findById(req.params.id);
        return res.render('userPanel/singleNews',{allCategory,singleNews})
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}