var express =require('express');
var path=require('path');
var mongoose =require('mongoose');
var methodOverride=require("method-override");
var bodyparser=require('body-parser');
var connection=require('../databaseconfig/configDb');
var passport=require('passport');
var LocalStrategy=require('passport-local');
var passportLocalMongoose=require('passport-local-mongoose');
Stud_user=require('../models/Suser');
mongoose.connect("mongodb://localhost/library_auth",{ useNewUrlParser: true,useUnifiedTopology: true });
var router =express();
router.use(express.static("public"));
router.use(bodyparser.urlencoded({extended:true}));
router.use(methodOverride("_method"));

//important and necessary code for passport authentication
router.use(require('express-session')({
    secret:"Rusty is best and cutest dog",
    resave:false,
    saveUninitialized:false
}));
router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(Stud_user.authenticate()));
passport.serializeUser(Stud_user.serializeUser());
passport.deserializeUser(Stud_user.deserializeUser());
//important and necessary code for passport authentication



router.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    next();
});

router.get('/students/index',isLoggedIn,(req,res)=>{
    var sql="SELECT * FROM books ORDER BY book_id";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err);
        else
        {
            res.render('students/index',{books:rows});
        }
    });
})

router.get('/students/search',isLoggedIn,(req,res)=>{
    res.render('students/search');
});

router.post('/students/search',(req,res)=>{
    var bkname=req.body.book_name;
    var bkauthor=req.body.book_author;
    var bkedition=req.body.book_edition;
    var sql="SELECT * FROM books WHERE book_name='"+bkname+"'OR book_author='"+bkauthor+"'OR book_edition='"+bkedition+"' ";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        {
            console.log(err);
        }
        else{
            console.log(rows)
            res.render('students/booksfound',{foundbooks:rows});
        }
    });

});




//---------------------------------------------
//authentication part
//---------------------------------------------
router.get('/students/register',(req,res)=>{
    res.render('students/register');
});


//registration 
router.post('/students/register',(req,res)=>{
// res.send('this will be registration route');
Stud_user.register(new Stud_user({username:req.body.username,firstName:req.body.first}),req.body.password,(err,user)=>{
    if(err){
    console.log(err);
    return res.render('students/register');
    }
    passport.authenticate("local")(req,res,()=>{
        var regId=req.body.username;
        var first=req.body.first;
        var last=req.body.last;
        var email=req.body.email;
        var mobile=req.body.mobile;
        var sql="INSERT INTO students (registration_no,first,last,email,mobile_no) VALUES('"+regId+"','"+first+"','"+last+"','"+email+"','"+mobile+"')";
        connection.query(sql,(err,rows,fields)=>{
            if(err)
            console.log(err);
            else
            res.redirect('/Student/students/index');
        });
        
    })
})
});

router.get('/students/login',(req,res)=>{
    res.render('students/login');
});

//login
router.post('/students/login', passport.authenticate("local",{
    successRedirect:"/Student/students/index",
    failureRedirect:"/Student/students/login"
}),(req,res)=>{

});
    

router.get("/students/logout",(req,res)=>{
    req.logout();
    res.redirect('/Student/students/login');
 });

 function isLoggedIn(req,res,next)
{
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/Student/students/login");
}
module.exports=router;