const express = require('express');
const CategoryCtl = require('../controller/categoryCtl');
const router = express.Router();
const {check} = require('express-validator');
const Category = require('../models/CategoryModel');

router.get('/',CategoryCtl.addCategory);

router.post('/insertCategory',[
    check('categoryName').notEmpty().withMessage("Category Name is required").custom(async value =>{
        const singleCategory = await Category.findOne({categoryName:value});
        if(singleCategory){
            throw new Error('This Category is Already Exist');
        }
    })
],CategoryCtl.insertCategory);

router.get('/viewCategory',CategoryCtl.viewCategory);

router.get('/changeCategoryStatus/:id/:status',CategoryCtl.changeCategoryStatus);

router.get('/deleteCategory/:id',CategoryCtl.deleteCategory);

router.post('/editCategory',CategoryCtl.editCategory);

router.post('/deactiveAll',CategoryCtl.deactiveAll);

router.post('/allDeactiveCategory',CategoryCtl.allDeactiveCategory);

module.exports = router;