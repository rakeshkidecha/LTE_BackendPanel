const express = require('express');

const router = express.Router();
const UserPanelCtl = require('../controller/userPanelCtl');

router.get('/',UserPanelCtl.home);

router.get('/singleNews/:id',UserPanelCtl.singleNews)

module.exports = router;