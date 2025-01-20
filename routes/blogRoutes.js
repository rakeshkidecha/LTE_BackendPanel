const express = require('express');
const BlogCtl = require('../controller/blogCtl');
const router = express.Router();

router.get('/',BlogCtl.addBlog);

router.post('/insertBlog',BlogCtl.insertBlog);

router.get('/viewBlog',BlogCtl.viewBlog);

router.get('/changeBlogStatus/:id/:statusType',BlogCtl.changeBlogStatus);

router.get('/deleteBlog/:id',BlogCtl.deleteBlog);

router.post('/editBlog',BlogCtl.editBlog); 

router.post('/deactiveAllBlog',BlogCtl.deactiveAllBlog);

router.post('/oprateAllDeactiveBlog',BlogCtl.oprateAllDeactiveBlog);

module.exports  = router;