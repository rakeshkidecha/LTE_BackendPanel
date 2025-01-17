const express = require('express');
const CategoryCtl = require('../controller/categoryCtl');
const router = express.Router();

router.get('/',CategoryCtl.addCategory);

router.post('/insertCategory',CategoryCtl.insertCategory);

router.get('/viewCategory',CategoryCtl.viewCategory);

router.get('/deactiveCategory/:id',CategoryCtl.deactiveCategory);

router.get('/activateCategory/:id',CategoryCtl.activateCategory);

router.get('/deleteCategory/:id',CategoryCtl.deleteCategory);

router.post('/editCategory',CategoryCtl.editCategory);

module.exports = router;