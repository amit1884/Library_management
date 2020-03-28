var express =require('express');
var path=require('path');
var methodOverride=require("method-override");
var bodyparser=require('body-parser');
var connection=require('../databaseconfig/configDb');
var session=require('express-session');
var cookie=require('cookie-parser');
var flash=require('connect-flash');
var bcrypt=require('bcrypt');
var router =express();
router.use(express.static("public"));
router.use(bodyparser.urlencoded({extended:true}));
router.use(methodOverride("_method"));

/* required statements to use session and flash*/
router.use(express.static("public"));
router.use(bodyparser.urlencoded({extended:true}));
router.use(methodOverride("_method"));
router.use(cookie());
router.set('trust proxy', 1) // trust first proxy
router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}))
router.use(flash());

const saltRounds = 10;
var message,sess,logmsg;
/*rendering routes*/
router.get('/students/',isLoggedIn,(req,res)=>{
    sess=req.session;
    // message=req.flash();

    if(sess.username)
    {
          logmsg=req.flash();
        var sql ="SELECT * FROM books ORDER BY book_id";
        connection.query(sql,(err,rows,field)=>{
            if(err){
                console.log(err);
            }
            else{
                res.render('students/index',{book:rows,currentuser:sess.username,mess:logmsg});
            }
        });
    
    }
    else{
        message =req.flash('error','Login Required');
        console.log(req.flash());
        res.redirect('/Student/students/login');
    }

   });

router.get('/students/login',(req,res)=>{
    message=req.flash();
    res.render('students/login',{message:message});
});
router.get('/students/register',(req,res)=>{
    res.render('students/register');
});
router.get('/students/search',isLoggedIn,(req,res)=>{
    res.render('students/search',{currentuser:sess.username});
});
//==============================================
router.get('/students/student_detail/:id',isLoggedIn,(req,res)=>{
    var reg_id=req.params.id;
    var sql="SELECT * FROM students LEFT JOIN issuebooks ON students.registration_no=issuebooks.reg_no WHERE students.registration_no='"+reg_id+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err);
        else{
            res.render('students/student_detail',{students:rows,currentuser:sess.username});
        }
    });
});
//==============================================
router.post('/students/register',(req,res)=>{
    var user=req.body.username;
    var first=req.body.first;
    var last=req.body.last;
    var branch=req.body.branch;
    var email=req.body.email;
    var mobile=req.body.mobile;
    var pwd=req.body.password;
    bcrypt.hash(pwd, saltRounds, function(err, hash) {
        var sql="INSERT INTO students (registration_no,password,first,last,branch,email,mobile_no) VALUES('"+user+"','"+hash+"','"+first+"','"+last+"','"+branch+"','"+email+"','"+mobile+"')";
        connection.query(sql,(err,rows,fields)=>{
            if(err)
            console.log("ERROR A GAYA "+err);
            else{
                message=req.flash('success','Registered successfull');
                res.redirect('/Student/students/login');
            }
        })
    });
});


router.post('/students/login',(req,res)=>{
    var username=req.body.username;
    var pwd=req.body.password;
    var sql="SELECT * FROM students WHERE registration_no='"+username+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err)
        else
        {
           if(rows.length<=0)
           {
               console.log('no user found');
               message= req.flash('error','No user found');
               res.redirect('/Student/students/login');
           }
           else{
               var hash=rows[0].password;
            bcrypt.compare(pwd, hash).then(function(result) {
               if(result){
                sess=req.session;
                sess.username=username;
               logmsg= req.flash('logsuccess','Login Successfully');
                console.log(req.flash());
              res.redirect('/Student/students/')
               }
               else{
                console.log(result);
                message= req.flash('error','Password Wrong');
                console.log('wrong password');
                res.redirect('/Student/students/login');
               }
               
            });
           }
        }
    })
    
})

router.get('/students/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/Student/students/login');
    });

});





//middleware to check user logged in or not
function isLoggedIn(req,res,next)
{
    sess=req.session;
    if(sess.username){
        return next();
    }
    message=req.flash('error','Login Required')
    res.redirect("/Student/students/login");
}
module.exports=router;