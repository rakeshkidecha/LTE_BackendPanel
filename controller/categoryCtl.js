const Category = require('../models/CategoryModel');

module.exports.addCategory = async (req,res)=>{
    try {
        return res.render('category/addCategory');
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.insertCategory= async(req,res)=>{
    try {

        const addedCategory = await Category.create(req.body);

        if(addedCategory){
            console.log("Category Added successfully");
            return res.redirect('back');
        }else{
            console.log("Faild to add Category");
            return res.redirect('back')
        }

    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.viewCategory = async(req,res)=>{
    try {

        let searchValue = '';
        let perPageData = 4;
        let page = 0;

        if(req.query.searchValue){
            searchValue = req.query.searchValue;
        }
        if(req.query.page){
            page = req.query.page;
        }

        const allCategory = await Category.find({categoryName:{$regex : searchValue,$options:'i'}}).skip(perPageData*page).limit(perPageData);

        const totalCategory = await Category.find({categoryName:{$regex : searchValue,$options:'i'}}).countDocuments();

        let totalCategoryPage = Math.ceil(totalCategory / perPageData);

        return res.render('category/viewCategory',{allCategory,searchValue,page:parseInt(page),totalCategoryPage});
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deactiveCategory = async (req,res)=>{
    try {
        const deactivedCategory = await Category.findByIdAndUpdate(req.params.id,{status:false});
        if(deactivedCategory){
            console.log("Category deactived successFully..");
            return res.redirect('back');
        }else{
            console.log("Faild to deactive Category");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.activateCategory = async (req,res)=>{
    try {
        const deactivedCategory = await Category.findByIdAndUpdate(req.params.id,{status:true});
        if(deactivedCategory){
            console.log("Category deactived successFully..");
            return res.redirect('back');
        }else{
            console.log("Faild to deactive Category");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deleteCategory = async(req,res)=>{
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if(deletedCategory){
            console.log("Category Deleted successfully");
            return res.redirect('back');
        }else{
            console.log("Faild to delete Category");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.editCategory = async(req,res)=>{
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.body.id,req.body);
        if(updatedCategory){
            console.log("Category Updated successfully..");
            return res.redirect('back');
        }else{
            console.log("Faild to update category");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}