const passport = require('passport');
const LocalStategy = require('passport-local').Strategy;
const Admin = require('../models/AdminModel');

passport.use(new LocalStategy({usernameField:'email'}, async function(email,password,done){
    console.log("middelware");
    console.log(email,password);
    const AdminData = await Admin.findOne({email:email});
    if(AdminData){
        if(AdminData.password==password){
            return done(null,AdminData);
        }else{
            return done(null,false);
        }
    }else{
        return done(null,false);
    }
}))

passport.serializeUser(function(user,done){
    return done(null,user.id);
})

passport.deserializeUser(async function(id,done){
    const adminData= await Admin.findById(id);
    if(adminData){
        return done(null,adminData);
    }else{
        return done(null,false);
    }
});


passport.setAuthAdminData = (req,res,next)=>{
    if(req.isAuthenticated()){
        res.locals.adminData = req.user;
    }
    next();
}

passport.checkLoginAdmin = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        return res.redirect('/login');
    }
}

module.exports = passport;