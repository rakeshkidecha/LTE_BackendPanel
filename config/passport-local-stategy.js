const passport = require('passport');
const LocalStategy = require('passport-local').Strategy;
const Admin = require('../models/AdminModel');
const User = require('../models/userModel');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use('admin_strategy',new LocalStategy({usernameField:'email',passReqToCallback:true}, async function(req,email,password,done){
    console.log("middelware");
    console.log(email,password);
    const AdminData = await Admin.findOne({email:email});
    if(AdminData){
        if(AdminData.password==password){
            return done(null,{...AdminData,role:'admin'});
        }else{
            req.flash('error',"Invalid Password");
            return done(null,false);
        }
    }else{
        req.flash('error',"Invalid Email");
        return done(null,false);
    }
}));

passport.use('user_strategy',new LocalStategy({usernameField:'email',passReqToCallback:true}, async function(req,email,password,done){
    console.log("middelware");
    console.log(email,password);
    const userData = await User.findOne({email:email});
    if(userData){
        if(userData.password==password){
            return done(null,{...userData,role:'user'});
        }else{
            req.flash('error',"Invalid Password");
            return done(null,false);
        }
    }else{
        req.flash('error',"Invalid Email");
        return done(null,false);
    }
}));

passport.use(new GoogleStrategy({
    clientID: '1020585624227-72sqeo7cptc9t9nkpe57f3cradhpub36.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:8004/auth/google/callback",
    passReqToCallback   : true
},async (req,accessToken, refreshToken, profile, done)=>{
    if(profile){
        const userData = await User.findOne({email:profile.emails[0].value});
        if(userData){
            return done(null,{...userData,role:'user'});
        }else{
            const newUserData = await User.create({
                email:profile.emails[0].value,
                password:profile.id,
                name:profile.displayName,
                profile_image : '/uploads/user/profile_image-1738388111358'
            })
            if(newUserData){
                return done(null,{...newUserData,role:'user'});
            }else{
                return done(null,false);
            }
        }
    }else{
        return done(null,false);
    }
}))


passport.serializeUser(function(user,done){
    return done(null,{id:user._doc._id,role:user.role});
})

passport.deserializeUser(async function(data,done){
    if(data.role=='admin'){
        const adminData= await Admin.findById(data.id); 
        if(adminData){
            return done(null,{...adminData,role:data.role});
        }else{
            return done(null,false);
        }
    }else if(data.role=='user'){
        const userData = await User.findById(data.id);
        if(userData){
            return done(null,{...userData,role:data.role});
        }else{
            return done(null,false);
        }
    }else{
        return done(null,false);
    }
});


passport.setAuthAdminData =async (req,res,next)=>{
    if(req.isAuthenticated()&&req.user.role == 'admin'){
        res.locals.adminData = req.user;
    }else if(req.isAuthenticated()&&req.user.role == 'user'){
        res.locals.userData = req.user;
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