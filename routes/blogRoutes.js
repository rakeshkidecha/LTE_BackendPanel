const express = require('express');
const BlogCtl = require('../controller/blogCtl');
const Blog = require('../models/BlogModel');
const router = express.Router();
const {check} = require('express-validator');

router.get('/',BlogCtl.addBlog);

router.post('/insertBlog',Blog.uploadImage,[
    check('categoryId').notEmpty().withMessage("Category is Required"),
    check('title').notEmpty().withMessage('Title is Required').isLength({min:5}).withMessage("Title must be Atleast 5 Carecter"),
    check('description').notEmpty().withMessage('Description is Required').isLength({min:8}).withMessage("Description Must be Atleast 8 carecter")
],BlogCtl.insertBlog);

router.get('/viewBlog',BlogCtl.viewBlog);

router.get('/changeBlogStatus/:id/:statusType',BlogCtl.changeBlogStatus);

router.get('/deleteBlog/:id',BlogCtl.deleteBlog);

router.get('/updateBlog/:id',BlogCtl.updateBlog);

router.post('/editBlog',Blog.uploadImage,BlogCtl.editBlog); 

router.post('/deactiveAllBlog',BlogCtl.deactiveAllBlog);

router.post('/oprateAllDeactiveBlog',BlogCtl.oprateAllDeactiveBlog);

router.get('/viewComment',BlogCtl.viewComment);

router.get('/changeCommentStatus',BlogCtl.changeCommentStatus);

module.exports  = router;