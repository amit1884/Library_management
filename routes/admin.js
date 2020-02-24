var express =require('express');
var path=require('path');
var methodOverride=require("method-override");
var bodyparser=require('body-parser');
var connection=require('../databaseconfig/configDb');
var router =express();
router.use(express.static("public"));
router.use(bodyparser.urlencoded({extended:true}));
router.use(methodOverride("_method"));
router.get('/',(req,res)=>{

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
router.get('/admin/bookentry',(req,res)=>{
    res.render('admin/bookentry');
});
router.get('/admin/register',(req,res)=>{
    res.render('admin/register');
});
router.get('/admin/login',(req,res)=>{
    res.render('admin/login');
});
//Basic page rendering routes

router.post('/admin/bookentry',(req,res)=>{

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