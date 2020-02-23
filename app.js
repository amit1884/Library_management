var express =require('express');
var path=require('path');
var mysql=require('mysql');
var methodOverride=require("method-override");
var bodyparser=require('body-parser');
var sanitizer=require("express-sanitizer");
var app =express();
app.set("view engine","ejs");
app.set('views',path.join(__dirname,'views'));
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
//database configuration 
var connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'library_management'
});
connection.connect((err)=>{
    if(err)
    console.log(err);
    else
    console.log('connected');
});
//database configuration ends here

app.get('/',(req,res)=>{
    res.render('index');
});

//Admin routes
//Basic page rendering routes
app.get('/admin/',(req,res)=>{

    var sql="SELECT * FROM books ORDER BY book_id";
    connection.query(sql,(err,rows,fields)=>{
        if(err)
        console.log(err);
        else
        {
            res.render('admin/index',{books:rows});
        }
    });
});
app.get('/admin/bookentry',(req,res)=>{
    res.render('admin/bookentry');
});
app.get('/admin/register',(req,res)=>{
    res.render('admin/register');
});
app.get('/admin/login',(req,res)=>{
    res.render('admin/login');
});
//Basic page rendering routes

app.post('/admin/bookentry',(req,res)=>{

var bk_id=req.body.book_id;
var bk_name=req.body.book_name;
var author=req.body.author;
var edt=req.body.edition;
var pub=req.body.publication;
var course=req.body.course;
var dept=req.body.department;
var bk_qty=req.body.book_qty;
var sql="INSERT INTO books (book_id,book_name,book_author,book_publication,book_edition,book_course,book_department,book_qty) VALUES('"+bk_id+"','"+bk_name+"','"+author+"','"+pub+"','"+edt+"','"+course+"','"+dept+"','"+bk_qty+"')";
connection.query(sql,(err,rows,fields)=>{
    if(err)
    {
        console.log(err);
        res.redirect('/admin/bookentry');
    }
    else{
        console.log('1 row inserted successfully');
        res.redirect('/admin/bookentry');
    }
});
});
app.post('/admin/:id',(req,res)=>{
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
app.get('/admin/:id',(req,res)=>{
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

app.put('/admin/update/:id',(req,res)=>{

    var updata=req.body.book_qty;
console.log(updata);
var sql="UPDATE books SET book_qty='"+updata+"' WHERE book_id='"+req.params.id+"'";
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




//Admin routes ends here



//Student Routes

//basic spage rendering routes
app.get('/students/index',(req,res)=>{
    res.render('students/index');
})
app.get('/students/register',(req,res)=>{
    res.render('students/register');
});
app.get('/students/login',(req,res)=>{
    res.render('students/login');
});
//Student Routes ends


app.listen(3000,()=>{
    console.log('server started');
});