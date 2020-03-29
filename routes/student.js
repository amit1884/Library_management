var express =require('express');
var path=require('path');
var methodOverride=require("method-override");
var bodyparser=require('body-parser');
var connection=require('../databaseconfig/configDb');
var session=require('express-session');
var cookie=require('cookie-parser');
var flash=require('connect-flash');
var bcrypt=require('bcrypt');
const PDFDocument = require('pdfkit');
const fs = require('fs');
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
//=====================================================================
//Basic Rendering routes
//======================================================================
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



//=================================================================================
//Student Detail route
//=================================================================================
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

//==========================================================================
//Students Details Pdf Downloading route
//==========================================================================

router.get('/students/downloadpdf/:id',(req,res)=>{
 var reg_id=req.params.id;
var sql="SELECT issuebooks.reg_no,issuebooks.book_id,issuebooks.issue_date,issuebooks.return_date,issuebooks.issued_by,issuebooks.fine,students.first,students.last,students.branch,students.email,students.mobile_no FROM issuebooks LEFT JOIN students ON issuebooks.reg_no=students.registration_no WHERE issuebooks.reg_no='"+reg_id+"'";
connection.query(sql,(err,row,fields)=>{
    if(err)
    console.log(err);
    else{

        const doc = new PDFDocument();
        const regid=row[0].reg_no;
        const name=row[0].first+' '+row[0].last;
        const branch=row[0].branch;
        const Email=row[0].email;
        const mobile=row[0].mobile_no;
        var date=new Date();
        var timestamp=date.getTime();
       doc.pipe(fs.createWriteStream('output'+timestamp+'.pdf'));
       doc
       .fontSize(20)
       .fillColor('brown')
       .text('Library Management System (NIT Jamshedpur)',100)
       .moveDown(0.9)
       .lineTo(100,160);
       doc
         .fontSize(20)
         .fillColor('black')
         .text(`Name :     ${name}`,70)
         .moveDown(0.5);
         doc
         .fontSize(20)
         .text(`Registration No :    ${regid}`)
         .moveDown(0.5);
         doc
         .fontSize(20)
         .text(`Branch :     ${branch}`)
         .moveDown(0.5);
         doc
         .fontSize(20)
         .text(`Email :     ${Email}`)
         .moveDown(0.5);
         doc
         .fontSize(20)
         .text(`Mobile :     ${mobile}`)
         .moveDown(0.5);
         doc
         .fontSize(20)
         .fillColor('blue')
         .text('Book Issue Detail',220)
         .moveDown(0.8);
        var i=1,totalfine=0;

       for(i=0;i<row.length;i++)
       {
         doc
         .fontSize(13)
         .fillColor('black')
         .text(`Sr. No.        :  ${i+1}`,70)  
         .text(`Book Id        :  ${row[i].book_id}`)  
         .text(`Issue Date     :  ${row[i].issue_date} `) 
         .text(`Return Date    :  ${row[i].return_date}`)   
         .text(`Issued By      :  ${row[i].issued_by}`)   
         .text(`Fine           :  ${row[i].fine}`)
         .moveDown(1.2);
        totalfine=totalfine+row[i].fine;

       }
       doc
       .moveDown(1.9)
         .fontSize(20)
         .fillColor('red')
         .text(`Total Fine :     ${totalfine}`)
         .moveDown(0.5);
       doc.end();
       
           res.send(row);
    }
});
});


//==========================================================================
//Students Registering route(backend)
//==========================================================================
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