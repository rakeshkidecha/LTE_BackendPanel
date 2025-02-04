const express = require('express');

const router = express.Router();
const UserPanelCtl = require('../controller/userPanelCtl');
const User= require('../models/userModel');
const passport = require('passport');
const {check} = require('express-validator');

router.get('/',UserPanelCtl.home);

router.get('/singleNews/:id',UserPanelCtl.singleNews);

// comments 
router.post('/addComment',UserPanelCtl.addComment);

router.get('/deleteComment/:id',UserPanelCtl.deleteComment);

router.get('/likeComment/:id/:blogId',UserPanelCtl.likeComment);
router.get('/dislikeComment/:id/:blogId',UserPanelCtl.dislikeComment);
//---------------

// user login adn sign up 
router.get('/userSignUp',UserPanelCtl.userSignUp);

router.post('/createUser',User.uploadUserImage,[
    check('fName').notEmpty().withMessage('First Name is Required').isLength({min:2}).withMessage('First Name Need Minimum 2 Catecter'),
    check('lName').notEmpty().withMessage('last Name is Required').isLength({min:2}).withMessage('Last Name Need Minimum 2 Catecter'),
    check('email').notEmpty().withMessage("Email is Required").custom(async value=>{
        const user = await User.findOne({email:value});
        if(user){
            throw new Error('this Email is Already used')
        }
    }),
    check('password').notEmpty().withMessage('Password is Required').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,20}$/, "i").withMessage("Password must be contain one lowercase, one uppercase, one special catecter ,an digit and 8-20 catecter length"),
    check('confirmPassword').notEmpty().withMessage('Confrim Password is Required').custom(async (value,{req}) =>{
        if(req.body.password != value){
            throw new Error('Confirm Password is not match with Password')
        }
    })
],UserPanelCtl.createUser);

router.get('/userLogin',UserPanelCtl.userLogin);

router.post('/checkUser',passport.authenticate('user_strategy',{failureRedirect:'/userLogin'}),UserPanelCtl.checkUser);

router.get('/google',
    passport.authenticate('google', {
        scope:['email', 'profile']
    }
));

router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/userLogin'}),async (req,res)=>{
    res.redirect('/');
})

router.get('/logOutUser',UserPanelCtl.logOutUser);
//---------------------------

module.exports = router;