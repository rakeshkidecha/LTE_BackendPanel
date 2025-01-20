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
        let date;
        let sortType ;

        if(req.query.searchValue){
            searchValue = req.query.searchValue;
        }

        if(req.query.date){
            date = new Date(req.query.date);
        }

        if(req.query.sortType){
            sortType = req.query.sortType
        }

        const allCategory = await Category.find({
            categoryName:{$regex : searchValue,$options:'i'},
            ...(date && {createdAt : {$gte:new Date(date).setHours(0,0,0,0),$lte:new Date(date).setHours(23, 59, 59, 999)}})
        }).sort({...(sortType && {categoryName:parseInt(sortType)})});

    
        return res.render('category/viewCategory',{allCategory,searchValue,date});
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.changeCategoryStatus = async (req,res)=>{
    try {
        const {id,status} = req.params;
        const changeStatusCategory = await Category.findByIdAndUpdate(id,{status:status});
        if(changeStatusCategory){
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

module.exports.deactiveAll = async(req,res)=>{
    try {
        console.log(req.body);
        const deactiveAllCategory = await Category.updateMany({_id:{$in:req.body.ids}},{status:false});
        if(deactiveAllCategory){
            console.log("Deactive all category..")
            return res.redirect('back');
        }else{
            console.log("Faild to deactive");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.allDeactiveCategory = async (req,res)=>{
    try {
        console.log(req.body);
        if(req.body.deActive){
            const activeAllCategory = await Category.updateMany({_id:{$in:req.body.ids}},{status:true});
            if(activeAllCategory){
                console.log("active all  category..");
                return res.redirect('back');
            }else{
                console.log("faild to active all category");
                return res.redirect('back');
            }
        }else{
            const deleteAllCategory = await Category.deleteMany({_id:{$in:req.body.ids}});
            if(deleteAllCategory){
                console.log("Delete All Category..");
                return res.redirect('back');
            }else{
                console.log("Falid to delete all category");
                return res.redirect('back');
            }
        }

    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}