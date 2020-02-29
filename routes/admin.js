var express =require('express');
var path=require('path');
var session=require('express-session');
var cookie=require('cookie-parser');
var flash=require('connect-flash');
var methodOverride=require("method-override");
var bodyparser=require('body-parser');
var connection=require('../databaseconfig/configDb');
var bcrypt=require('bcrypt');
var router =express();
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

var sess;
router.get('/',(req,res)=>{

    sess = req.session;
    console.log(sess.username);
    if(sess.username) {
        var sql="SELECT * FROM books ORDER BY book_id";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err);
        else
        {
            res.render('admin/index',{books:rows,activeId:sess.username});
        }
    });
    }
    else{
        res.redirect('/Admin/admin/login');
    }
    
});
router.get('/admin/bookentry',(req,res)=>{
    
    sess = req.session;
    // console.log(sess.username);
    if(sess.username) {
        res.render('admin/bookentry');
    }
    else
    res.redirect('/Admin/admin/login');
   
});
router.get('/admin/register',(req,res)=>{
    res.render('admin/register');
});
router.get('/admin/login',(req,res)=>{

    res.render('admin/login');
});
router.get('/admin/list_of_admins',(req,res)=>{

    sess = req.session;
    // console.log(sess.username);
    if(sess.username) {
        var sql="SELECT * FROM librarian";
        connection.query(sql,(err,rows,fields)=>{
            if(err)
            console.log(err)
            else
            res.render('admin/list_of_admins',{libdata:rows});
        });  
    }
    else
    res.redirect('/Admin/admin/login');
    
});
//Basic page rendering routes-------------------------------------------------------------

//--------------------------------------------------------------------------------
//Auth routes
//------------------------------------------------------

router.post('/admin/register',(req,res)=>{
    var user=req.body.username;
    var pwd=req.body.password;
    var first=req.body.first;
    var last=req.body.last;
    var email=req.body.email;
    var mobile=req.body.mobile;
    bcrypt.hash(pwd, saltRounds, function(err, hash) {
        var sql="INSERT INTO librarian (username,first,last,mobile,email,password) VALUES('"+user+"','"+first+"','"+last+"','"+mobile+"','"+email+"','"+hash+"')";
        connection.query(sql,(err,rows,fields)=>{
            if(err)
            console.log(err);
            else{
                req.flash('msg1','registered successfully');
                res.redirect('/Admin/admin/login');
            }
        })
    });
});



router.post('/admin/login',(req,res)=>{
    var username=req.body.username;
    var pwd=req.body.password;
    var sql="SELECT * FROM librarian WHERE username='"+username+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err)
        else
        {
           if(rows.length<=0)
           {
               console.log('no user found');
           }
           else{
               var hash=rows[0].password;
               console.log(hash);
               console.log(pwd);
            bcrypt.compare(pwd, hash).then(function(result) {
               if(result){
                sess=req.session;
                sess.username=username;
                console.log(sess.username);
              res.redirect('/admin')
               }
               else{
                console.log(result);
                console.log('wrong password');
                res.redirect('/Admin/admin/login');
               }
               
            });
           }
        }
    })
    
})
router.get('/admin/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/Admin/admin/login');
    });

});

//----------------------------------------------------------------------------
//Data manipulating routes
//----------------------------------------------------------------------------
router.post('/admin/bookentry',(req,res)=>{
var bk_name=req.body.book_name;
var author=req.body.author;
var edt=req.body.edition;
var pub=req.body.publication;
var course=req.body.course;
var dept=req.body.department;
var bk_qty=req.body.book_qty;
var sql="INSERT INTO books (book_name,book_author,book_publication,book_edition,book_course,book_department,book_qty) VALUES('"+bk_name+"','"+author+"','"+pub+"','"+edt+"','"+course+"','"+dept+"','"+bk_qty+"')";
connection.query(sql,(err,rows,fields)=>{
    if(err)
    {
        console.log(err);
        res.redirect('/admin');
    }
    else{
        console.log('1 row inserted successfully');
        res.redirect('/admin/Admin/bookentry');
    }
});
});
router.post('/admin/:id',(req,res)=>{
    var bid=req.params.id;
    var sql="DELETE FROM books WHERE book_id='"+bid+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        {
            console.log(err);
            res.redirect('/admin');
        }
        else
        {
            console.log('1 row deleted successfully');
            res.redirect('/admin');
        }
    });
});
router.get('/admin/:id',(req,res)=>{
    var bkid=req.params.id;
    console.log(bkid);
    var sql="SELECT * FROM books WHERE book_id='"+bkid+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        {
            console.log(err);
            res.redirect('/admin');
        }
        else{
            console.log(rows);
            res.render('admin/updatebook',{bkdata:rows});
        }
    });
});

router.put('/admin/update/:id',(req,res)=>{

    var upedt=req.body.edition;
    var updata=req.body.book_qty;
console.log(updata);
var sql="UPDATE books SET book_qty='"+updata+"',book_edition='"+upedt+"' WHERE book_id='"+req.params.id+"'";
connection.query(sql,(err,rows,fields)=>{
    if(err)
    {
        console.log(err);
        res.redirect('/admin');
    }
    else{
        console.log('Row updated');
        res.redirect('/admin');
    }
});
});

module.exports=router;