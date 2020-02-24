var express =require('express');
var path=require('path');
var methodOverride=require("method-override");
var bodyparser=require('body-parser');
var connection=require('../databaseconfig/configDb');
var router =express();
router.use(express.static("public"));
router.use(bodyparser.urlencoded({extended:true}));
router.use(methodOverride("_method"));

router.get('/students/index',(req,res)=>{
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
router.get('/students/register',(req,res)=>{
    res.render('students/register');
});
router.get('/students/login',(req,res)=>{
    res.render('students/login');
});

module.exports=router;