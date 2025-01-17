const express = require('express');
const BlogCtl = require('../controller/blogCtl');
const router = express.Router();

router.get('/',BlogCtl.addBlog);

router.post('/insertBlog',BlogCtl.insertBlog);

router.get('/viewBlog',BlogCtl.viewBlog);

router.get('/deleteBlog/:id',BlogCtl.deleteBlog);

router.post('/editBlog',BlogCtl.editBlog); 

module.exports  = router;