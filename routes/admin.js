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

var sess,logmsg,message;
router.get('/',(req,res)=>{

    sess = req.session;
    console.log(sess.username);
    if(sess.username||sess.head) {
        logmsg=req.flash();
        console.log(logmsg);
        var sql="SELECT * FROM books ORDER BY book_id";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err);
        else
        {
            res.render('admin/index',{books:rows,activeId:sess.username,head:sess.head,successmsg:logmsg});
        }
    });
    }
    else{
        res.redirect('/Admin/admin/login');
    }
    
});
router.get('/admin/bookentry',(req,res)=>{
    
    sess = req.session;
    if(sess.username||sess.head) {
        message=req.flash();
        res.render('admin/bookentry',{active:sess.username,successmsg:message,head:sess.head});
    }
    else
    {
        message=req.flash('msg3','Login Required');
        res.redirect('/Admin/admin/login');
    }
});
router.get('/admin/book_issue',(req,res)=>{
    
    sess = req.session;
    message=req.flash();
    // console.log(sess.username);
    if(sess.username||sess.head) {
        res.render('admin/book_issue',{activeId:sess.username,head:sess.head,mess:message});
    }
    else
    {
        message=req.flash('msg3','Login Required');
        res.redirect('/Admin/admin/login');
    }
    
   
});
//=============================
//Student List rendering routes
//=============================
router.get('/admin/student_detail',isLoggedIn,(req,res)=>{
    sess=req.session;
    var sql="SELECT * FROM students ORDER BY registration_no";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        {
            console.log(err);
        }
        else{
            res.render('admin/student_detail',{students:rows,activeId:sess.username,head:sess.head});
        }
    });
});
//=============================
//Registration rendering routes
//=============================
router.get('/admin/register',(req,res)=>{
    res.render('admin/register');
});
//=============================
//Login rendering routes
//=============================
router.get('/admin/login',(req,res)=>{
    message=req.flash();
   
    res.render('admin/login',{mess:message});
});
//====================================
//head Admin routes
//====================================

router.get('/admin/master_login',(req,res)=>{
    res.render('admin/master_login');
});
router.post('/admin/master_login',(req,res)=>{
    var headuser=req.body.username;
    var password=req.body.password;
    var sql="SELECT * FROM admin WHERE username='"+headuser+"' AND password='"+password+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err);
        else if(rows.length>0)
        {
            sess=req.session;
            sess.head=headuser;
            console.log(sess.head);
            logmsg= req.flash('success','Login successfully');
            res.redirect('/Admin/admin/list_of_admins');
        }
        else{
            res.redirect('/Admin/admin/master_login');
        }
    });
});


router.get('/admin/list_of_admins',(req,res)=>{

    sess = req.session;
    // console.log(sess.username);
    if(sess.head) {
        var sql="SELECT * FROM librarian";
        connection.query(sql,(err,rows,fields)=>{
            if(err)
            console.log(err)
            else
            {
                logmsg=req.flash();
                res.render('admin/list_of_admins',{libdata:rows,head:sess.head,successmsg:logmsg});
            }
            
        });  
    }
    else
    res.redirect('/Admin/admin/login');
    
});
//removing librarians form librarian table
router.get('/admin/master/:id',(req,res)=>{
    var bid=req.params.id;
    var sql="DELETE FROM librarian WHERE username='"+bid+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        {
            console.log(err);
            res.redirect('/Admin/admin/list_of_admins');
        }
        else
        {
            logmsg=req.flash('delete','Librarian Record Deleted ');
            console.log('1 row deleted successfully');
            res.redirect('/Admin/admin/list_of_admins');
        }
    });
});
//updating the flag of the librarians

router.post('/admin/master/:id',(req,res)=>{
    var bid=req.params.id;
    var sql="SELECT * FROM librarian WHERE username='"+bid+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err);
        else{
            if(rows[0].flag==1)
            {
                var sql="UPDATE librarian SET flag='0' WHERE username='"+bid+"'";
                connection.query(sql,(err,results,fields)=>{
                    if(err)
                    console.log(err);
                    else
                    {
                        logmsg=req.flash('updated','Librarian Record Updated ');
                        res.redirect('/Admin/admin/list_of_admins');
                    }
                });
            }
            else{
                var sql="SELECT * FROM librarian WHERE flag='1'";
                connection.query(sql,(err,rows,fields)=>{
                    if(err)
                    console.log(err)
                    else if(rows.length==2)
                    {
                        logmsg=req.flash('error','Maximum Number reached');
                        res.redirect('/Admin/admin/list_of_admins');
                    }
                    else
                    {
                        var sql="UPDATE librarian SET flag='1' WHERE username='"+bid+"'";
                        connection.query(sql,(err,results,fields)=>{
                            if(err)
                            console.log(err);
                            else
                            {
                                logmsg=req.flash('updated','Librarian Record Updated ');
                                res.redirect('/Admin/admin/list_of_admins');
                            }
                           
                        });
                    }
                });
            }
        }
    });
});

//=========================================================================================

//--------------------------------------------------------------------------------
//Auth routes for librarians
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
                message=req.flash('msg1','registered successfully');
                res.redirect('/Admin/admin/login');
            }
        })
    });
});



router.post('/admin/login',(req,res)=>{
    var username=req.body.username;
    var pwd=req.body.password;
    var sql="SELECT * FROM librarian WHERE username='"+username+"'AND flag='1'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err)
        else
        {
           if(rows.length<=0)
           {
               console.log('no user found or you do not have authorisation');
               message= req.flash('error','No user found or you do not have authorisation');
               res.redirect('/Admin/admin/login');
           }
           else{
               var hash=rows[0].password;
            bcrypt.compare(pwd, hash).then(function(result) {
               if(result){
                sess=req.session;
                sess.username=username;
               logmsg= req.flash('success','Login successfully');
                // console.log(logmsg);
                console.log(sess.username);
              res.redirect('/admin')
               }
               else{
                console.log(result);
                message= req.flash('error','Login Unsuccessfully');
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
//Book Entry  routes
//----------------------------------------------------------------------------
router.post('/admin/bookentry',(req,res)=>{
var bk_name=req.body.book_name;
var author=req.body.author;
var edt=req.body.edition;
var pub=req.body.publication;
var course=req.body.course;
var dept=req.body.department;
var bk_qty=req.body.book_qty;
if(edt>0&&bk_qty>0)
{
    var sql="INSERT INTO books (book_name,book_author,book_publication,book_edition,book_course,book_department,book_qty) VALUES('"+bk_name+"','"+author+"','"+pub+"','"+edt+"','"+course+"','"+dept+"','"+bk_qty+"')";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        {
            console.log(err);
            message=req.flash('error','Error Occurred');
            res.redirect('/admin');
        }
        else{
            message=req.flash('success','Book Added Successfully');
            console.log('1 row inserted successfully');
            res.redirect('/Admin/admin/bookentry');
        }
    });
}
else{
    message=req.flash('error','Enter Positive Numbers');
    res.redirect('/Admin/admin/bookentry');
}

});

//============================================
//Book Issue route
//============================================

router.post('/admin/book_issue',(req,res)=>{

    var username=req.body.username;
    var book_id=req.body.book_id;
    var issue_by=req.body.issued_by;
    console.log(req.body.issued_by);
    var return_date=req.body.return_date;

    var sql="SELECT * FROM students WHERE registration_no='"+username+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err);
        else{
            if(rows.length>0){
                var sql="SELECT * FROM books WHERE book_id='"+book_id+"'"
                connection.query(sql,(err,rows,field)=>{
                    if(err)
                    {
                        console.log(err)
                    }
                    else{
                        if(rows.length>0){
                            var sql="INSERT INTO issuebooks(registration_no,book_id,return_date,issued_by) VALUES('"+username+"','"+book_id+"','"+return_date+"','"+issue_by+"')";
                            connection.query(sql,(err,rows,fields)=>{
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    console.log("inserted");
                                    message=req.flash('success','Book issued successfully');
                                    res.redirect('/Admin/admin/book_issue');
                                }
                            });
                        }
                        else{
                            message=req.flash('error','No Book found of specified book id');
                            res.redirect('/Admin/admin/book_issue');
                        }
                    }
                });
            }
            else{
                message=req.flash('error','No user found');
                res.redirect('/Admin/admin/book_issue');
            }
        }
    });
});
//=====================================
//Book Remove route(backend)
//=====================================
router.post('/admin/:id',(req,res)=>{
    var bid=req.params.id;
    var sql="DELETE FROM books WHERE book_id='"+bid+"'";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        {
            console.log(err);
            message=req.flash('error','Error Occurred');
            res.redirect('/admin');
        }
        else
        {
            message=req.flash('success','Book Removed Successfully');
            console.log('1 row deleted successfully');
            res.redirect('/admin');
        }
    });
});
//====================================
//Book update rendering route(frontend)
//=====================================
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
            res.render('admin/updatebook',{bkdata:rows,activeId:sess.username});
        }
    });
});

//====================================
//Book update route(backend)
//=====================================
router.put('/admin/update/:id',(req,res)=>{

    var upedt=req.body.edition;
    var updata=req.body.book_qty;
console.log(updata);
if(upedt>0&&updata>0)
{
    var sql="UPDATE books SET book_qty='"+updata+"',book_edition='"+upedt+"' WHERE book_id='"+req.params.id+"'";
connection.query(sql,(err,rows,fields)=>{
    if(err)
    {
        console.log(err);
        res.redirect('/admin');
    }
    else{
        logmsg=req.flash('update','Update Successfully');
        console.log('Row updated');
        res.redirect('/admin');
    }
});
}
else{
    logmsg=req.flash('error','Enter Positive Value');
    res.redirect('/admin');
}

});

//middleware to check user logged in or not
function isLoggedIn(req,res,next)
{
    sess=req.session;
    if(sess.username||sess.head){
        return next();
    }
    message=req.flash('error','Login Required')
    res.redirect("/Admin/admin/login");
}

module.exports=router;